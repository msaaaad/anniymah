import { PartialType } from '@nestjs/swagger';
import { CreateHeroBannerDto } from './create-hero-banner.dto.js';

export class UpdateHeroBannerDto extends PartialType(CreateHeroBannerDto) {}
