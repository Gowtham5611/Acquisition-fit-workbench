from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from app.models.lead import Lead
from app.schemas.decision import (
    VerificationGap, ConfidenceBreakdown, DecisionSummaryResponse,
    TargetComparisonItem, CompareResponse, AcquisitionBriefResponse,
    MatrixPoint, ResearchQueueItem, InsightsResponse
)

class DecisionService:
    @staticmethod
    def calculate_data_confidence(lead_dict: Dict[str, Any]) -> float:
        """
        Calculate data confidence (0-100%) based on completeness of 11 core firmographic & contact fields.
        """
        has_location = bool(lead_dict.get('city') and lead_dict.get('state'))
        single_fields = [
            'company_name', 'website', 'industry', 'employee_count',
            'revenue', 'founded_year', 'owner_name', 'owner_email',
            'phone', 'linkedin_url'
        ]
        present_count = sum(
            1 for f in single_fields 
            if lead_dict.get(f) is not None and str(lead_dict.get(f)).strip() != ''
        )
        if has_location:
            present_count += 1
        return round((present_count / 11.0) * 100.0, 1)

    @staticmethod
    def calculate_confidence_breakdown(lead_dict: Dict[str, Any]) -> ConfidenceBreakdown:
        """
        Categorizes available fields into Strong vs Needs Verification.
        """
        strong = []
        needs_verification = []

        field_labels = [
            ('company_name', 'Company Name'),
            ('website', 'Company Website'),
            ('industry', 'Industry Classification'),
            ('revenue', 'Reported Revenue'),
            ('employee_count', 'Headcount'),
            ('founded_year', 'Operating History'),
            ('owner_name', 'Decision Maker Name'),
            ('owner_email', 'Direct Owner Email'),
            ('phone', 'Phone Number'),
            ('linkedin_url', 'LinkedIn Profile'),
        ]

        if lead_dict.get('city') and lead_dict.get('state'):
            strong.append('Geographic Location')
        else:
            needs_verification.append('Geographic Location')

        for field, label in field_labels:
            val = lead_dict.get(field)
            if val is not None and str(val).strip() != '':
                strong.append(label)
            else:
                needs_verification.append(label)

        return ConfidenceBreakdown(strong=strong, needs_verification=needs_verification)

    @staticmethod
    def calculate_verification_gaps(lead_dict: Dict[str, Any]) -> List[VerificationGap]:
        """
        Returns prioritized verification gaps derived strictly from missing data fields.
        """
        gaps: List[VerificationGap] = []

        # High priority data gaps: direct contact or primary financial metric
        if not lead_dict.get('owner_email'):
            gaps.append(VerificationGap(
                priority="HIGH",
                field="owner_email",
                label="Owner Direct Email Missing",
                description="Direct email for principal or executive contact is not recorded."
            ))
        if lead_dict.get('revenue') is None or lead_dict.get('revenue') == '':
            gaps.append(VerificationGap(
                priority="HIGH",
                field="revenue",
                label="Revenue Data Unconfirmed",
                description="Financial revenue figure is missing; verify through filings or broker notes."
            ))

        # Medium priority data gaps: leadership identity or scale validation
        if not lead_dict.get('owner_name'):
            gaps.append(VerificationGap(
                priority="MEDIUM",
                field="owner_name",
                label="Decision Maker Unidentified",
                description="Primary owner, founder, or CEO name is not attached to this record."
            ))
        if not lead_dict.get('linkedin_url'):
            gaps.append(VerificationGap(
                priority="MEDIUM",
                field="linkedin_url",
                label="Executive LinkedIn Missing",
                description="Professional profile link unavailable for executive tenure verification."
            ))
        if lead_dict.get('founded_year') is None or lead_dict.get('founded_year') == '':
            gaps.append(VerificationGap(
                priority="MEDIUM",
                field="founded_year",
                label="Founding Year Missing",
                description="Business age cannot be computed without verified founding year."
            ))
        if lead_dict.get('employee_count') is None or lead_dict.get('employee_count') == '':
            gaps.append(VerificationGap(
                priority="MEDIUM",
                field="employee_count",
                label="Headcount Missing",
                description="Staff size required to confirm organizational operational scale."
            ))

        # Low priority data gaps: secondary communication or web presence
        if not lead_dict.get('phone'):
            gaps.append(VerificationGap(
                priority="LOW",
                field="phone",
                label="Phone Number Missing",
                description="Corporate or executive telephone contact is not listed."
            ))
        if not lead_dict.get('website'):
            gaps.append(VerificationGap(
                priority="LOW",
                field="website",
                label="Company Website Missing",
                description="Domain URL missing; verify current online presence."
            ))

        return gaps

    @staticmethod
    def determine_quadrant(fit_score: Optional[float], data_confidence: float) -> Tuple[str, str]:
        """
        Calculates Opportunity Matrix Quadrant based on:
        High Fit >= 70, High Confidence >= 75%.
        """
        score = fit_score if fit_score is not None else 0.0
        if score >= 70.0 and data_confidence >= 75.0:
            return "PRIORITY_TARGETS", "Priority Targets"
        elif score >= 70.0 and data_confidence < 75.0:
            return "VERIFY_FIRST", "Verify First"
        elif score < 70.0 and data_confidence >= 75.0:
            return "KNOWN_LOW_FIT", "Known Low Fit"
        else:
            return "DEPRIORITIZE", "Deprioritize"

    @staticmethod
    def determine_next_best_action(
        lead_dict: Dict[str, Any], 
        fit_score: Optional[float], 
        data_confidence: float,
        neg_signals: Optional[List[str]] = None
    ) -> str:
        """
        Deterministic recommendation based only on missing fields, fit, and confidence.
        """
        score = fit_score if fit_score is not None else 0.0
        negatives = neg_signals or []

        # Check for explicit exclusion
        for neg in negatives:
            if "exclusion keyword" in neg.lower():
                return "Exclude from acquisition pipeline"

        # Fit too low
        if score < 50.0:
            return "Deprioritize"

        # Core critical data missing
        if lead_dict.get('revenue') is None or str(lead_dict.get('revenue')).strip() == '':
            return "Verify revenue range"
        if lead_dict.get('employee_count') is None or str(lead_dict.get('employee_count')).strip() == '':
            return "Verify employee count"
        if not lead_dict.get('owner_name'):
            return "Identify decision maker"
        if not lead_dict.get('owner_email') and not lead_dict.get('phone'):
            return "Source decision maker contact info"

        # High fit checks
        if score >= 70.0:
            if data_confidence >= 75.0:
                return "Prioritize for initial owner research"
            else:
                return "Verify core company data before outreach"

        if score >= 50.0 and score < 70.0:
            return "Review thesis fit with deal lead"

        return "Verify target parameters"

    @staticmethod
    def generate_why_this_target(
        lead_dict: Dict[str, Any],
        fit_score: Optional[float],
        data_confidence: float,
        pos_signals: Optional[List[str]] = None
    ) -> str:
        """
        Generates concise 2-3 sentence executive explanation of the target.
        """
        score = fit_score if fit_score is not None else 0.0
        ind = lead_dict.get('industry') or 'Unclassified'
        city = lead_dict.get('city') or ''
        state = lead_dict.get('state') or ''
        loc = f"{city}, {state}".strip(", ") or "Location pending"
        rev = lead_dict.get('revenue')
        rev_str = f"${rev:,.0f}" if rev else "Undisclosed revenue"

        if score >= 80.0:
            if data_confidence >= 75.0:
                return (
                    f"Strong acquisition fit with verified data confidence. "
                    f"Company matches core thesis in {ind} ({loc}) with reported revenue of {rev_str}. "
                    f"High confidence across firmographic criteria makes this a priority for initial research."
                )
            else:
                return (
                    f"Promising acquisition alignment in {ind} ({loc}), but data confidence is currently limited ({data_confidence:.0f}%). "
                    f"Firmographic signals indicate strong criteria fit, but key contact and operational fields require verification prior to outreach."
                )
        elif score >= 60.0:
            return (
                f"Moderate fit against acquisition criteria in {ind} ({loc}). "
                f"Target displays favorable business size and profile, with partial geographic or scale variation. "
                f"Recommended for secondary review after priority targets."
            )
        else:
            return (
                f"Low alignment with current acquisition criteria ({score:.0f}/100 fit). "
                f"Significant variance in industry, scale, or geographic parameters. "
                f"Deprioritized for active sourcing pipeline."
            )

    @classmethod
    def get_decision_summary(cls, lead: Lead) -> DecisionSummaryResponse:
        lead_dict = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
        fit_score = lead.fit_score
        data_conf = lead.data_quality_score or cls.calculate_data_confidence(lead_dict)
        quadrant, q_label = cls.determine_quadrant(fit_score, data_conf)
        gaps = cls.calculate_verification_gaps(lead_dict)
        conf_breakdown = cls.calculate_confidence_breakdown(lead_dict)
        next_action = lead.next_best_action or cls.determine_next_best_action(lead_dict, fit_score, data_conf)
        why_text = cls.generate_why_this_target(lead_dict, fit_score, data_conf)

        return DecisionSummaryResponse(
            lead_id=lead.id,
            company_name=lead.company_name,
            fit_score=fit_score,
            data_confidence=data_conf,
            priority=lead.priority or 'UNSCORED',
            quadrant=quadrant,
            quadrant_label=q_label,
            why_this_target=why_text,
            next_best_action=next_action,
            verification_gaps=gaps,
            confidence_breakdown=conf_breakdown
        )

    @classmethod
    def compare_targets(cls, leads: List[Lead]) -> CompareResponse:
        if len(leads) < 2 or len(leads) > 3:
            raise ValueError("Target comparison requires exactly 2 or 3 leads.")

        items: List[TargetComparisonItem] = []
        for l in leads:
            ld = {c.name: getattr(l, c.name) for c in l.__table__.columns}
            conf = l.data_quality_score or cls.calculate_data_confidence(ld)
            _, q_label = cls.determine_quadrant(l.fit_score, conf)
            age = None
            if l.founded_year:
                age = datetime.now().year - l.founded_year
            
            loc = f"{l.city or ''}, {l.state or ''}".strip(', ') or None
            next_action = l.next_best_action or cls.determine_next_best_action(ld, l.fit_score, conf)

            items.append(TargetComparisonItem(
                id=l.id,
                company_name=l.company_name,
                fit_score=l.fit_score,
                data_confidence=conf,
                priority=l.priority or 'UNSCORED',
                quadrant_label=q_label,
                industry=l.industry,
                location=loc,
                revenue=l.revenue,
                employee_count=l.employee_count,
                founded_year=l.founded_year,
                business_age=age,
                decision_maker=l.owner_name,
                decision_maker_title=l.owner_title,
                next_best_action=next_action
            ))

        # Determine objective relative highlights
        strongest = max(items, key=lambda x: (x.fit_score or 0.0)).company_name
        best_conf = max(items, key=lambda x: x.data_confidence).company_name
        most_verification = min(items, key=lambda x: x.data_confidence).company_name

        notes = [
            f"Strongest fit against current criteria: {strongest}",
            f"Best data confidence: {best_conf} ({max(i.data_confidence for i in items):.0f}%)",
            f"Requires most verification before diligence: {most_verification} ({min(i.data_confidence for i in items):.0f}%)"
        ]

        return CompareResponse(
            targets=items,
            strongest_fit=strongest,
            best_confidence=best_conf,
            needs_most_verification=most_verification,
            comparison_notes=notes
        )

    @classmethod
    def generate_acquisition_brief(cls, lead: Lead) -> AcquisitionBriefResponse:
        ld = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
        fit_score = lead.fit_score or 0.0
        data_conf = lead.data_quality_score or cls.calculate_data_confidence(ld)
        gaps = cls.calculate_verification_gaps(ld)
        next_action = lead.next_best_action or cls.determine_next_best_action(ld, fit_score, data_conf)

        age = datetime.now().year - lead.founded_year if lead.founded_year else None
        
        # Parse positive reasons from score_reasons if present
        why_ranks = []
        if lead.score_reasons:
            import json
            try:
                reasons = json.loads(lead.score_reasons)
                if isinstance(reasons, dict):
                    why_ranks = reasons.get('positive', [])
                elif isinstance(reasons, list):
                    why_ranks = reasons
            except Exception:
                pass
        
        if not why_ranks:
            why_ranks = [
                f"Industry alignment in {lead.industry or 'Sector'}",
                f"Operating scale with {lead.employee_count or 'unspecified'} employees"
            ]

        snapshot = {
            "company_name": lead.company_name,
            "website": lead.website or "Not available",
            "domain": lead.domain or "Not available",
            "industry": lead.industry or "Unspecified",
            "location": f"{lead.city or ''}, {lead.state or ''}, {lead.country or ''}".strip(', '),
            "revenue": f"${lead.revenue:,.0f}" if lead.revenue else "Unrecorded",
            "employee_count": lead.employee_count or "Unrecorded",
            "founded_year": lead.founded_year or "Unrecorded",
            "business_age_years": age if age else "Unknown",
            "decision_maker": lead.owner_name or "Unidentified",
            "decision_maker_title": lead.owner_title or "Unidentified",
            "contact_email": lead.owner_email or "Missing",
            "contact_phone": lead.phone or "Missing",
            "linkedin_url": lead.linkedin_url or "Missing"
        }

        acquisition_fit = {
            "fit_score": fit_score,
            "data_confidence": data_conf,
            "priority": lead.priority or "UNSCORED",
            "quadrant": cls.determine_quadrant(fit_score, data_conf)[1]
        }

        source_meta = {
            "source": lead.source or "Demo Dataset",
            "source_url": lead.source_url or "N/A",
            "record_id": lead.id,
            "last_updated": str(lead.updated_at or lead.created_at)
        }

        return AcquisitionBriefResponse(
            lead_id=lead.id,
            company_name=lead.company_name,
            generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
            disclaimer="Preliminary Acquisition Research Brief — Based on available company information. For pre-diligence sourcing and qualification only.",
            target_snapshot=snapshot,
            acquisition_fit=acquisition_fit,
            why_it_ranks=why_ranks,
            verify_before_proceeding=gaps,
            next_best_action=next_action,
            source_metadata=source_meta
        )
