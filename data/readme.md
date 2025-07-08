
# Data Storage

This folder is used to store application data using localStorage in the browser.

## Data Structure

The application stores the following data in localStorage:

- `blog_posts`: Array of blog posts
- `blog_users`: Array of registered users
- `blog_comments`: Array of comments
- `blog_likes`: Array of likes

## Default Data

The application automatically creates an admin user with:
- Username: ********
- Password: ************
- Email: *************.com

## Data Persistence

All data is stored locally in the browser's localStorage. This means:
- Data persists between browser sessions
- Data is specific to each browser/device
- Clearing browser data will reset the application

## Development

To reset all data during development, run:
```javascript
localStorage.clear();
```
in the browser console and refresh the page.
