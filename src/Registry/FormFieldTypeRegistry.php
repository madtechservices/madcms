<?php

namespace MadTechServices\MadCms\Registry;

use MadTechServices\MadCms\Contracts\FormFieldTypeRegistry as FormFieldTypeRegistryContract;
use MadTechServices\MadCms\Registry\Concerns\RegistersNamedTypes;

class FormFieldTypeRegistry implements FormFieldTypeRegistryContract
{
    use RegistersNamedTypes;

    /** @param array<int|string, string|array<string, mixed>> $types */
    public function __construct(array $types = [])
    {
        $this->registerInitialTypes($types);
    }
}
