export class Satellite {
  constructor (
    public Name: string,
    public CountryOperatorOwner: string,
    public OperatorOwner: string,
    public Users: string,
    public Purpose: string,
    public ApogeeKM: number,
    public LaunchMassKG: number,
    public DateOfLaunch: string,
    public LaunchSite: string
  ) { }
}
