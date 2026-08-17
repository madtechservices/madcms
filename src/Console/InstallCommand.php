<?php

namespace MadTechServices\MadCms\Console;

use Illuminate\Console\Command;
use Inertia\Inertia;

class InstallCommand extends Command
{
    protected $signature = 'madcms:install
        {--frontend : Publish the versioned frontend contract into resources/js/vendor/madcms}
        {--admin-ui : Publish the frontend contract and optional Inertia admin page entrypoints}
        {--force : Overwrite existing published files}';

    protected $description = 'Install MAD CMS configuration without changing existing routes, tables, or content';

    public function handle(): int
    {
        $mode = (string) config('madcms.mode', 'hybrid');
        $this->components->info("Installing MAD CMS in safe {$mode} mode.");

        if ($this->option('admin-ui') && ! class_exists(Inertia::class)) {
            $this->components->error('The optional admin UI requires inertiajs/inertia-laravel. Install it before using --admin-ui.');

            return self::FAILURE;
        }

        $arguments = ['--tag' => 'madcms-config'];
        if ($this->option('force')) {
            $arguments['--force'] = true;
        }

        $this->call('vendor:publish', $arguments);

        if ($this->option('frontend') || $this->option('admin-ui')) {
            $frontendArguments = ['--tag' => 'madcms-frontend'];
            if ($this->option('force')) {
                $frontendArguments['--force'] = true;
            }

            $this->call('vendor:publish', $frontendArguments);
        }

        if ($this->option('admin-ui')) {
            $pageArguments = ['--tag' => 'madcms-admin-pages'];
            if ($this->option('force')) {
                $pageArguments['--force'] = true;
            }
            $this->call('vendor:publish', $pageArguments);
        }

        $this->newLine();
        $this->components->warn('No routes, migrations, models, content, or live builder files were replaced.');
        $this->line('Run <fg=cyan>php artisan madcms:status</> to inspect extraction readiness.');

        return self::SUCCESS;
    }
}
