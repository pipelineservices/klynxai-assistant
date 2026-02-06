"""
Pre-built demo scenarios for Dragon Playground
Each scenario demonstrates different risk levels and Dragon's response
"""

PRESET_SCENARIOS = [
    {
        "id": "prod-deployment",
        "title": "Production Deployment",
        "icon": "⚠️",
        "difficulty": "high",
        "expected_risk": "HIGH",
        "data": {
            "title": "Deploy v2.0 to Production",
            "action": "terraform apply -target=production -auto-approve",
            "rationale": "New feature release with database schema changes and API updates",
            "impact": "All users affected, 50K+ transactions/day, 99.9% SLA commitment",
            "risk": {
                "blast_radius": "entire_production",
                "data_risk": "schema_migration",
                "rollback_complexity": "high",
                "customer_impact": "critical"
            }
        }
    },
    {
        "id": "pricing-change",
        "title": "Pricing Change",
        "icon": "💰",
        "difficulty": "high",
        "expected_risk": "HIGH",
        "data": {
            "title": "Increase API pricing by 30%",
            "action": "kubectl apply -f config/pricing-update.yaml",
            "rationale": "Cost optimization based on infrastructure usage analysis",
            "impact": "All paying customers (~2000 accounts), $500K annual revenue impact",
            "risk": {
                "revenue_impact": "high",
                "churn_risk": "medium-high",
                "competitor_advantage": "possible",
                "customer_notification": "required"
            }
        }
    },
    {
        "id": "iam-permission",
        "title": "IAM Permission Grant",
        "icon": "🔐",
        "difficulty": "critical",
        "expected_risk": "CRITICAL",
        "data": {
            "title": "Grant S3 admin access to intern account",
            "action": "aws iam attach-user-policy --user-name intern-bob --policy-arn arn:aws:iam::aws:policy/AdministratorAccess",
            "rationale": "Needs to debug production S3 bucket issue for customer data retrieval",
            "impact": "Full AWS admin access including customer data, billing, IAM management",
            "risk": {
                "security_impact": "critical",
                "data_exposure": "customer_pii",
                "compliance_violation": "least_privilege_principle",
                "audit_flag": "excessive_permissions"
            }
        }
    },
    {
        "id": "code-formatting",
        "title": "Code Formatting",
        "icon": "✨",
        "difficulty": "low",
        "expected_risk": "LOW",
        "data": {
            "title": "Run prettier on frontend code",
            "action": "npm run format && git commit -am 'style: format code'",
            "rationale": "Standardize code style across team before PR merge",
            "impact": "Code formatting only, no functional changes, dev environment",
            "risk": {
                "blast_radius": "none",
                "reversibility": "immediate",
                "data_risk": "none",
                "cost": "minimal"
            }
        }
    },
    {
        "id": "database-delete",
        "title": "Database Delete",
        "icon": "💣",
        "difficulty": "critical",
        "expected_risk": "CRITICAL",
        "data": {
            "title": "Drop unused staging database",
            "action": "DROP DATABASE production_customers;",
            "rationale": "Cleanup after migration to new database cluster",
            "impact": "Remove old customer database (intended: staging, actual: production)",
            "risk": {
                "blast_radius": "critical",
                "data_loss": "irreversible",
                "typo_detected": "says 'production' not 'staging'",
                "backup_available": "unknown"
            }
        }
    },
    {
        "id": "test-suite",
        "title": "Run Test Suite",
        "icon": "🧪",
        "difficulty": "low",
        "expected_risk": "LOW",
        "data": {
            "title": "Run integration tests",
            "action": "pytest tests/integration/ --verbose",
            "rationale": "Validate recent API changes before deployment",
            "impact": "Test environment only, no production impact",
            "risk": {
                "blast_radius": "none",
                "cost": "minimal",
                "duration": "5-10 minutes",
                "environment": "test_only"
            }
        }
    }
]


def get_scenario_by_id(scenario_id: str) -> dict:
    """Get scenario data by ID"""
    for scenario in PRESET_SCENARIOS:
        if scenario["id"] == scenario_id:
            return scenario
    return None


def get_all_scenarios() -> list:
    """Get all available scenarios"""
    return PRESET_SCENARIOS


def get_scenarios_by_difficulty(difficulty: str) -> list:
    """Get scenarios filtered by difficulty level"""
    return [s for s in PRESET_SCENARIOS if s["difficulty"] == difficulty]
