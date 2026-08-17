<?php

namespace MadTechServices\MadCms\Registry;

use InvalidArgumentException;
use MadTechServices\MadCms\Contracts\ModuleTypeRegistry as ModuleTypeRegistryContract;

class ModuleTypeRegistry implements ModuleTypeRegistryContract
{
    /** @var array<string, array<string, mixed>> */
    private array $types = [];

    /** @param array<int|string, string|array<string, mixed>> $types */
    public function __construct(array $types = [])
    {
        foreach ($types as $key => $value) {
            if (is_string($key) && is_array($value)) {
                $this->register($key, $value);
            } elseif (is_string($value)) {
                $this->register($value);
            }
        }
    }

    public function all(): array
    {
        return array_keys($this->types);
    }

    public function definitions(): array
    {
        return $this->types;
    }

    public function register(string $type, array $definition = []): void
    {
        $type = trim($type);

        if ($type === '' || preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $type) !== 1) {
            throw new InvalidArgumentException('MAD CMS module types must use lowercase kebab-case.');
        }

        $this->types[$type] = array_replace($this->types[$type] ?? [], $definition);
    }

    public function has(string $type): bool
    {
        return array_key_exists($type, $this->types);
    }
}
