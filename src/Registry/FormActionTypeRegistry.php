<?php

namespace MadTechServices\MadCms\Registry;

use MadTechServices\MadCms\Contracts\FormActionTypeRegistry as FormActionTypeRegistryContract;
use MadTechServices\MadCms\Registry\Concerns\RegistersNamedTypes;

class FormActionTypeRegistry implements FormActionTypeRegistryContract
{
    use RegistersNamedTypes;

    /** @param array<int|string, string|array<string, mixed>> $types */
    public function __construct(array $types = [])
    {
        $this->registerInitialTypes($types);
    }
}
