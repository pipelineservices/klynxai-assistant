export type IncidentPlanStep = {
  id?: string;
  title?: string;
  risk?: string;
  dry_run_cmd?: string | null;
  apply_cmd?: string | null;
};

export type PlanExecutionResult = {
  step_id?: string;
  title?: string;
  risk?: string;
  mode?: "dry_run" | "apply";
  status?: string;
  command?: string | null;
  output?: string | null;
};

export type IncidentPlan = {
  meta?: {
    cloud?: string;
    region?: string;
    severity?: string;
    summary?: string;
    dry_run_default?: boolean;
  };
  probable_cause?: string;
  analysis_text?: string;
  steps?: IncidentPlanStep[];
  execution?: {
    mode?: string;
    results?: PlanExecutionResult[];
  };
};

export type IncidentItem = {
  id?: string;
  thread_ts?: string;
  channel_id?: string;
  created_at?: string;
  last_updated_at?: string;
  status?: string;
  severity?: string;
  summary?: string;
  cloud?: string;
  region?: string;
  resources?: string;
  probable_cause?: string;
  analysis_text?: string;
  plan?: IncidentPlan;
};
