@component('mail::message')
# Activate my account

To activate your account please click on the button below


@component('mail::button', ['url' => $url])
activate
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
