import { PartialType } from '@nestjs/swagger';
import { CreateLandingPageDto } from './create-landing-page.dto.js';

export class UpdateLandingPageDto extends PartialType(CreateLandingPageDto) {}
