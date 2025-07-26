import { PartialType } from '@nestjs/swagger';
import { CreateSubSnippetDto } from './create-sub-snippet.dto';

export class UpdateSubSnippetDto extends PartialType(CreateSubSnippetDto) {}
