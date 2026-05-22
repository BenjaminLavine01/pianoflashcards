/**
 * Public runtime config for Vercel (keys are safe to expose to the browser).
 * Set in Vercel → Project → Settings → Environment Variables:
 *   SPARTAN_BACKEND=supabase
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_ANON_KEY=eyJ...
 */
module.exports = (req, res) => {
    const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
    const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();
    const hasKeys = Boolean(supabaseUrl && supabaseAnonKey);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
        backend: hasKeys ? 'supabase' : (process.env.SPARTAN_BACKEND || 'local'),
        supabaseUrl,
        supabaseAnonKey,
        ok: hasKeys
    });
};
