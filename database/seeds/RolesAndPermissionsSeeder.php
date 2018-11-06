<?php

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()['cache']->forget('spatie.permission.cache');

        // create permissions
        Permission::create(['guard_name' => 'web', 'name' => 'edit articles']);
        Permission::create(['guard_name' => 'web', 'name' => 'delete articles']);
        Permission::create(['guard_name' => 'web', 'name' => 'publish articles']);
        Permission::create(['guard_name' => 'web', 'name' => 'unpublish articles']);

        // create roles and assign created permissions

        $role = Role::create(['guard_name' => 'web', 'name' => 'writer']);
        $role->givePermissionTo('edit articles');

        $role = Role::create(['guard_name' => 'web', 'name' => 'moderator']);
        $role->givePermissionTo(['publish articles', 'unpublish articles']);

        $role = Role::create(['guard_name' => 'admin', 'name' => 'super-admin']);
        $role->givePermissionTo(Permission::all());
    }
}