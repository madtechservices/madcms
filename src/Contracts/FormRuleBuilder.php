<?php

namespace MadTechServices\MadCms\Contracts;

use MadTechServices\MadCms\Models\CmsForm;

interface FormRuleBuilder
{
    /** @return array<string, array<int, mixed>> */
    public function for(CmsForm $form): array;
}
