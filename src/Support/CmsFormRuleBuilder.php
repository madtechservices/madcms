<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Validation\Rule;
use MadTechServices\MadCms\Contracts\FormRuleBuilder;
use MadTechServices\MadCms\Models\CmsForm;
use MadTechServices\MadCms\Models\CmsFormField;

class CmsFormRuleBuilder implements FormRuleBuilder
{
    public function for(CmsForm $form): array
    {
        $rules = [];

        foreach ($form->fields as $field) {
            $rules[$field->name] = $this->forField($field);
        }

        return $rules;
    }

    /** @return array<int, mixed> */
    protected function forField(CmsFormField $field): array
    {
        $rules = [$field->required ? 'required' : 'nullable'];

        if ($field->type === 'email') {
            $rules[] = 'email';
        } elseif (in_array($field->type, ['select', 'radio'], true) && is_array($field->options)) {
            $values = collect($field->options)
                ->map(fn ($option) => is_array($option) ? ($option['value'] ?? $option['label'] ?? null) : $option)
                ->filter()
                ->values()
                ->all();

            if ($values) {
                $rules[] = Rule::in($values);
            }
        } elseif (in_array($field->type, ['checkbox', 'consent'], true)) {
            $rules[] = 'boolean';
        } else {
            $rules[] = 'string';
            $rules[] = 'max:5000';
        }

        foreach (($field->validation_rules ?? []) as $rule) {
            if (is_string($rule)) {
                $rules[] = $rule;
            }
        }

        return $rules;
    }
}
