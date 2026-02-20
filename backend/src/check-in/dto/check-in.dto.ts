export class CheckInDto {
  passportId: string;
  discomfortLevel: number; // 1-5
  assistanceRequested?: string[]; // e.g. interpreter, mobility, quiet-space, info
  intendsToStay: boolean;
  timestamp?: string;
}
