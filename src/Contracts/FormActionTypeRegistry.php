<?php

namespace MadTechServices\MadCms\Contracts;

interface FormActionTypeRegistry
{
    /** @return list<string> */
    public function all(): array;

    /** @return array<string, array<string, mixed>> */
    public function definitions(): array;

    /** @param array<string, mixed> $definition */
    public function register(string $type, array $definition = []): void;

    public function has(string $type): bool;
}
