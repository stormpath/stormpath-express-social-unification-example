# What's this About?

So, you're using [Stormpath](https://stormpath.com/) to secure your Express.js
website, and are allowing users to log into your web application via Social
Login (*Facebook, Google, etc.*).

Things are going great, with one big drawback: when a user logs in via a social
provider, you want to ensure their account is UNIQUE!  You don't want a separate
user account for both Randall the Facebook user and Randall the Google user,
right?

Well, you're in luck!

This example application demonstrates how you can 'unify' your social login
accounts in Stormpath via the usage of a simple Express.js middleware function.

This code is re-usable, and will safely unify your social accounts for you.


## How Does it Work?

The way this works is simple:

- If a logged-in user is detected to be a social user, then we'll look in
  Stormpath for a non-social user account (*a cloud account*).
- If the above check fails, we'll create a new cloud account for the user, and
  swap the current user session!
- If the above check passes, we'll swap the current user session for the cloud
  user.

Those three steps ensure that no matter HOW your user logs in, the same account
is always used.  This makes building large-scale applications significantly
simpler.


## Testing it Out

To test this out, you'll need to install this project locally:

```console
$ git clone https://github.com/stormpath/stormpath-express-social-unification-example.git
$ cd stormpath-express-social-unification-example
$ npm install
```

You'll then need to specify a few environment variables:

```console
$ export STORMPATH_CLIENT_APIKEY_ID=xxx
$ export STORMPATH_CLIENT_APIKEY_SECRET=xxx
$ export STORMPATH_APPLICATION_HREF=xxx
```

Those settings MUST be defined in order for this sample application to work.

Furthermore, your Stormpath Application MUST have at least one social directory
AND cloud directory mapped to it.  Without these, this code is pointless!

Assuming the above prerequisites are met, you can run this application by
typing:

```console
$ node server.js
```

Into the console, then visiting http://localhost:3000 and logging in with a
social account.

You'll notice that your account is swapped AUTOMATICALLY for you, with no
intervention necessary.


## Questions?

Contact [support@stormpath.com](mailto:support@stormpath.com)
