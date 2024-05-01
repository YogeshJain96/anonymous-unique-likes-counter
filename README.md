# anonymous-unique-likes-counter

To manage likes on blog posts without requiring users to login or sign up. Uses [Supabase](https://supabase.com/) as the backend for storing likes data and [FingerprintJS](https://github.com/fingerprintjs/fingerprintjs) for unique visitor identification. 

# set-up

1. Signup/Signin to Supabase and create a  `likes` table 

    ```sql
    CREATE TABLE IF NOT EXISTS likes (
        like_id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(100) NOT NULL,
        post_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_like UNIQUE (visitor_id, post_id)
    );
    ```
2. Replace `supabaseUrl` & `supabaseKey` with [your supabase creds](https://supabase.com/docs/guides/api#api-url-and-keys) in [script.js](script.js)
