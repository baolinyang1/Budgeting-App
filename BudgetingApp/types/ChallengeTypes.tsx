
export interface ChallengeType {
    name: string, 
    amount: number,
    totalAmount: number,
    deadline: string,
    year: string
    month: string
    day: string
}

export type progressChart = {
    data: [number]
}

export type ChallengeInfo = {
    challenge: ChallengeType;
    chart: progressChart;
  }