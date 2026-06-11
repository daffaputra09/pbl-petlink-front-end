export interface PlatformFeeMonthlyPoint {
  month: number;
  label: string;
  gmv: number;
  platform_fee: number;
}

export interface PlatformFeeStats {
  total_gmv: number;
  total_platform_fee: number;
  platform_fee_this_month: number;
  platform_fee_prev_month: number;
  platform_fee_growth_percent: number | null;
  year: number;
  monthly: PlatformFeeMonthlyPoint[];
}

export interface PlatformFeeRow {
  id: string;
  paid_at: string;
  reference_type: "booking" | "consultation";
  reference_id: string;
  amount: number;
  platform_fee: number;
  clinic_net_amount: number;
  payment_method: string | null;
  midtrans_payment_type: string | null;
  clinic_name: string;
  customer_name: string;
}
