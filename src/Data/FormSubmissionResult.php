<?php

namespace MadTechServices\MadCms\Data;

use MadTechServices\MadCms\Models\CmsFormSubmission;

class FormSubmissionResult
{
    /** @param array<string, mixed> $payload */
    public function __construct(
        public readonly string $message,
        public readonly bool $discarded,
        public readonly array $payload = [],
        public readonly ?CmsFormSubmission $submission = null,
    ) {}
}
