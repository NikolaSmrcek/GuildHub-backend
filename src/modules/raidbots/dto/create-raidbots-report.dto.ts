import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateRaidbotsReportDto {
  @IsString()
  @IsNotEmpty({ message: 'raidbotsReportUrl must not be empty' })
  @IsUrl({ require_tld: false }, { message: 'raidbotsReportUrl must be a valid URL' })
  raidbotsReportUrl!: string;
}
