require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname, 'bak');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const AVATARS = ['me', 'av1', 'av2', 'av3', 'av4', 'av5'];

const WILAYA_COORDS = {
  Alger: { lat: 36.7538, lng: 3.0588 },
  Algiers: { lat: 36.7538, lng: 3.0588 },
  Oran: { lat: 35.6971, lng: -0.6308 },
  Constantine: { lat: 36.365, lng: 6.6147 },
  Blida: { lat: 36.47, lng: 2.83 },
  Annaba: { lat: 36.9, lng: 7.7667 },
  'Sétif': { lat: 36.1911, lng: 5.4137 },
  Setif: { lat: 36.1911, lng: 5.4137 },
  'Tizi Ouzou': { lat: 36.7118, lng: 4.0459 },
  'Béjaïa': { lat: 36.7509, lng: 5.0567 },
  Bejaia: { lat: 36.7509, lng: 5.0567 },
  Batna: { lat: 35.5559, lng: 6.1741 },
  Tlemcen: { lat: 34.8783, lng: -1.315 },
};

app.use(express.json({ limit: '1mb' }));

function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).trim();
}

function getSupabaseKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    ''
  ).trim();
}

function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}

function getSupabaseClient(accessToken) {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) return null;

  const options = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };

  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return createClient(url, key, options);
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function extractToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  const cookies = parseCookies(req);
  return cookies.bak_access_token || null;
}

function setAuthCookies(res, req, session) {
  if (!session || !session.access_token) return;
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const common = `HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${
    isHttps ? 'SameSite=None; Secure' : 'SameSite=Lax'
  }`;
  res.setHeader('Set-Cookie', [
    `bak_access_token=${encodeURIComponent(session.access_token)}; ${common}`,
    `bak_refresh_token=${encodeURIComponent(session.refresh_token || '')}; ${common}`,
  ]);
}

function clearAuthCookies(res, req) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const common = `HttpOnly; Path=/; Max-Age=0; ${
    isHttps ? 'SameSite=None; Secure' : 'SameSite=Lax'
  }`;
  res.setHeader('Set-Cookie', [
    `bak_access_token=; ${common}`,
    `bak_refresh_token=; ${common}`,
  ]);
}

function coordsForWilaya(wilaya) {
  if (!wilaya) return WILAYA_COORDS.Alger;
  return WILAYA_COORDS[wilaya] || WILAYA_COORDS.Alger;
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(R * c));
}

function requireSupabase(_req, res, next) {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not configured.',
    });
  }
  next();
}

async function requireAuth(req, res, next) {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not configured.',
    });
  }

  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
  }

  const supabase = getSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data || !data.user) {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid or expired session' });
  }

  req.accessToken = token;
  req.supabase = supabase;
  req.user = data.user;
  next();
}

const HEALTH_COLS = [
  'weight_over_50',
  'has_chronic_illness',
  'illness_details',
  'recent_surgery_or_tattoo',
  'taking_medication',
  'last_donation_date',
  'eligibility_status',
];

function computeEligibility(h) {
  if (!h.weight_over_50 || h.has_chronic_illness) return 'deferred';
  if (h.recent_surgery_or_tattoo || h.taking_medication) return 'review';
  return 'eligible';
}

function extractHealthFields(src = {}) {
  const health = {
    weight_over_50: typeof src.weight_over_50 === 'boolean' ? src.weight_over_50 : true,
    has_chronic_illness: typeof src.has_chronic_illness === 'boolean' ? src.has_chronic_illness : false,
    illness_details: typeof src.illness_details === 'string' ? src.illness_details.trim() : '',
    recent_surgery_or_tattoo:
      typeof src.recent_surgery_or_tattoo === 'boolean' ? src.recent_surgery_or_tattoo : false,
    taking_medication: typeof src.taking_medication === 'boolean' ? src.taking_medication : false,
    last_donation_date: typeof src.last_donation_date === 'string' ? src.last_donation_date.trim() : '',
  };
  health.eligibility_status = computeEligibility(health);
  return health;
}

function isMissingColumnError(err) {
  if (!err) return false;
  const msg = String(err.message || '');
  return err.code === '42703' || err.code === 'PGRST204' || msg.includes('column') || msg.includes('schema cache');
}

function stripHealthCols(obj) {
  const copy = { ...obj };
  for (const col of HEALTH_COLS) delete copy[col];
  return copy;
}

function mergeHealthMeta(profile, user) {
  if (!profile) return profile;
  const meta = (user && user.user_metadata) || {};
  const fallback = extractHealthFields(meta);
  const merged = { ...profile };
  for (const col of HEALTH_COLS) {
    if (merged[col] === undefined) {
      merged[col] = fallback[col];
    }
  }
  return merged;
}

async function ensureProfile(supabase, user) {
  const { data: existing, error: selErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (selErr) {
    throw selErr;
  }
  if (existing) {
    return mergeHealthMeta(existing, user);
  }

  const meta = user.user_metadata || {};
  const wilaya = typeof meta.wilaya === 'string' && meta.wilaya.trim() ? meta.wilaya.trim() : 'Alger';
  const baseCoords = coordsForWilaya(wilaya);
  const bloodGroup = BLOOD_GROUPS.includes(meta.blood_group) ? meta.blood_group : 'O+';
  const health = extractHealthFields(meta);
  const donorAllowed = health.eligibility_status === 'deferred' ? false : (typeof meta.is_donor === 'boolean' ? meta.is_donor : true);

  const payload = {
    id: user.id,
    full_name:
      typeof meta.full_name === 'string' && meta.full_name.trim()
        ? meta.full_name.trim()
        : (user.email || 'User').split('@')[0],
    email: user.email || '',
    blood_group: bloodGroup,
    wilaya,
    birth_date: typeof meta.birth_date === 'string' ? meta.birth_date : '',
    phone: typeof meta.phone === 'string' ? meta.phone : '',
    avatar: AVATARS.includes(meta.avatar) ? meta.avatar : 'me',
    is_donor: donorAllowed,
    lat: typeof meta.lat === 'number' ? meta.lat : baseCoords.lat,
    lng: typeof meta.lng === 'number' ? meta.lng : baseCoords.lng,
    notifications_enabled: true,
    ...health,
  };

  let { data: inserted, error: insErr } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (insErr && isMissingColumnError(insErr)) {
    ({ data: inserted, error: insErr } = await supabase
      .from('profiles')
      .upsert(stripHealthCols(payload), { onConflict: 'id' })
      .select('*')
      .single());
  }

  if (insErr) {
    throw insErr;
  }
  return mergeHealthMeta(inserted, user);
}

/* ---------- Auth API ---------- */

app.post('/api/auth/signup', requireSupabase, async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      blood_group,
      wilaya,
      birth_date,
      phone,
      is_donor,
    } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Valid email is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'INVALID_PASSWORD', message: 'Password must be at least 6 characters.' });
    }
    if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
      return res.status(400).json({ error: 'INVALID_NAME', message: 'Full name is required.' });
    }

    const cleanWilaya = typeof wilaya === 'string' && wilaya.trim() ? wilaya.trim() : 'Alger';
    const coords = coordsForWilaya(cleanWilaya);
    const cleanBlood = BLOOD_GROUPS.includes(blood_group) ? blood_group : 'O+';
    const health = extractHealthFields(req.body || {});
    const donorFlag =
      health.eligibility_status === 'deferred'
        ? false
        : typeof is_donor === 'boolean'
          ? is_donor
          : true;

    const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    const originHeader = typeof req.headers.origin === 'string' ? req.headers.origin.trim() : '';
    const redirectBase = originHeader || (host ? `${proto}://${host}` : '');

    const supabase = getSupabaseClient();
    const signUpOptions = {
      data: {
        full_name: full_name.trim(),
        blood_group: cleanBlood,
        wilaya: cleanWilaya,
        birth_date: typeof birth_date === 'string' ? birth_date.trim() : '',
        phone: typeof phone === 'string' ? phone.trim() : '',
        is_donor: donorFlag,
        lat: coords.lat,
        lng: coords.lng,
        avatar: 'me',
        ...health,
      },
    };
    if (redirectBase && !/localhost|127\.0\.0\.1/.test(redirectBase)) {
      signUpOptions.emailRedirectTo = `${redirectBase.replace(/\/+$/, '')}/`;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: signUpOptions,
    });

    if (error) {
      return res.status(400).json({ error: 'SIGNUP_FAILED', message: error.message });
    }

    let profile = null;
    if (data.session && data.user) {
      setAuthCookies(res, req, data.session);
      const userClient = getSupabaseClient(data.session.access_token);
      profile = await ensureProfile(userClient, data.user);
    }

    return res.status(201).json({
      user: data.user,
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }
        : null,
      profile,
      emailConfirmationRequired: !data.session,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Signup failed' });
  }
});

app.post('/api/auth/login', requireSupabase, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'MISSING_CREDENTIALS', message: 'Email and password are required.' });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });

    if (error || !data.session || !data.user) {
      return res.status(401).json({
        error: 'LOGIN_FAILED',
        message: (error && error.message) || 'Invalid credentials',
      });
    }

    setAuthCookies(res, req, data.session);
    const userClient = getSupabaseClient(data.session.access_token);
    const profile = await ensureProfile(userClient, data.user);

    return res.json({
      user: data.user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      profile,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Login failed' });
  }
});

app.post('/api/auth/refresh', requireSupabase, async (req, res) => {
  try {
    const cookies = parseCookies(req);
    const refreshToken = (req.body && req.body.refresh_token) || cookies.bak_refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: 'NO_REFRESH_TOKEN', message: 'Refresh token missing' });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session || !data.user) {
      clearAuthCookies(res, req);
      return res.status(401).json({ error: 'REFRESH_FAILED', message: 'Session expired' });
    }

    setAuthCookies(res, req, data.session);
    const userClient = getSupabaseClient(data.session.access_token);
    const profile = await ensureProfile(userClient, data.user);

    return res.json({
      user: data.user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      profile,
    });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Refresh failed' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = extractToken(req);
    if (token && isSupabaseConfigured()) {
      const supabase = getSupabaseClient(token);
      await supabase.auth.signOut().catch(() => {});
    }
    clearAuthCookies(res, req);
    return res.json({ ok: true });
  } catch (_err) {
    clearAuthCookies(res, req);
    return res.json({ ok: true });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const profile = await ensureProfile(req.supabase, req.user);
    const { count: completedCount } = await req.supabase
      .from('donations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('status', 'completed');

    return res.json({
      user: req.user,
      profile,
      stats: {
        donations: completedCount || 0,
        lives_saved: (completedCount || 0) * 3,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to load profile' });
  }
});

/* ---------- Profile API ---------- */

app.put('/api/profile', requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.full_name === 'string' && body.full_name.trim()) {
      updates.full_name = body.full_name.trim();
    }
    if (BLOOD_GROUPS.includes(body.blood_group)) {
      updates.blood_group = body.blood_group;
    }
    if (typeof body.wilaya === 'string' && body.wilaya.trim()) {
      updates.wilaya = body.wilaya.trim();
      if (typeof body.lat !== 'number' || typeof body.lng !== 'number') {
        const coords = coordsForWilaya(updates.wilaya);
        updates.lat = coords.lat;
        updates.lng = coords.lng;
      }
    }
    if (typeof body.birth_date === 'string') {
      updates.birth_date = body.birth_date.trim();
    }
    if (typeof body.phone === 'string') {
      updates.phone = body.phone.trim();
    }
    if (AVATARS.includes(body.avatar)) {
      updates.avatar = body.avatar;
    }
    if (typeof body.is_donor === 'boolean') {
      updates.is_donor = body.is_donor;
    }
    if (typeof body.notifications_enabled === 'boolean') {
      updates.notifications_enabled = body.notifications_enabled;
    }
    if (typeof body.lat === 'number' && Number.isFinite(body.lat)) {
      updates.lat = body.lat;
    }
    if (typeof body.lng === 'number' && Number.isFinite(body.lng)) {
      updates.lng = body.lng;
    }

    const hasHealthInput =
      'weight_over_50' in body ||
      'has_chronic_illness' in body ||
      'illness_details' in body ||
      'recent_surgery_or_tattoo' in body ||
      'taking_medication' in body ||
      'last_donation_date' in body;

    const existingProfile = await ensureProfile(req.supabase, req.user);
    let healthMeta = null;

    if (hasHealthInput) {
      const mergedHealth = extractHealthFields({ ...existingProfile, ...body });
      Object.assign(updates, mergedHealth);
      if (mergedHealth.eligibility_status === 'deferred') {
        updates.is_donor = false;
      }
      healthMeta = mergedHealth;
      await req.supabase.auth.updateUser({ data: mergedHealth }).catch(() => {});
    }

    let { data, error } = await req.supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select('*')
      .single();

    if (error && isMissingColumnError(error)) {
      ({ data, error } = await req.supabase
        .from('profiles')
        .update(stripHealthCols(updates))
        .eq('id', req.user.id)
        .select('*')
        .single());
    }

    if (error) {
      return res.status(400).json({ error: 'PROFILE_UPDATE_FAILED', message: error.message });
    }

    const outProfile = healthMeta ? { ...data, ...healthMeta } : mergeHealthMeta(data, req.user);
    return res.json({ profile: outProfile });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to update profile' });
  }
});

/* ---------- Donors Directory & Map API ---------- */

app.get('/api/donors', async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not configured.',
      donors: [],
    });
  }

  try {
    const token = extractToken(req);
    const supabase = getSupabaseClient(token);
    const { blood_group, wilaya, q, lat, lng } = req.query;

    let query = supabase
      .from('profiles')
      .select('id, full_name, blood_group, wilaya, phone, avatar, is_donor, lat, lng')
      .eq('is_donor', true)
      .order('updated_at', { ascending: false });

    if (blood_group && blood_group !== 'all' && BLOOD_GROUPS.includes(blood_group)) {
      query = query.eq('blood_group', blood_group);
    }
    if (wilaya && wilaya !== 'all') {
      query = query.ilike('wilaya', `%${String(wilaya).trim()}%`);
    }
    if (q && String(q).trim()) {
      const term = String(q).trim();
      query = query.or(`full_name.ilike.%${term}%,wilaya.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(400).json({ error: 'DONORS_QUERY_FAILED', message: error.message, donors: [] });
    }

    const refLat = Number.isFinite(Number(lat)) ? Number(lat) : 36.7538;
    const refLng = Number.isFinite(Number(lng)) ? Number(lng) : 3.0588;

    const donors = (data || []).map((row) => {
      const dLat = typeof row.lat === 'number' ? row.lat : coordsForWilaya(row.wilaya).lat;
      const dLng = typeof row.lng === 'number' ? row.lng : coordsForWilaya(row.wilaya).lng;
      return {
        id: row.id,
        n: row.full_name,
        g: row.blood_group,
        w: row.wilaya,
        tel: row.phone || '',
        a: AVATARS.includes(row.avatar) ? row.avatar : 'av1',
        lat: dLat,
        lng: dLng,
        d: distanceKm(refLat, refLng, dLat, dLng),
      };
    });

    donors.sort((a, b) => a.d - b.d);
    return res.json({ donors });
  } catch (err) {
    console.error('Donors query error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to fetch donors', donors: [] });
  }
});

/* ---------- Donations API ---------- */

app.get('/api/donations', requireAuth, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('donations')
      .select('*')
      .eq('user_id', req.user.id)
      .order('donation_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: 'DONATIONS_QUERY_FAILED', message: error.message });
    }

    return res.json({ donations: data || [] });
  } catch (err) {
    console.error('Donations fetch error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to load donations' });
  }
});

app.post('/api/donations', requireAuth, async (req, res) => {
  try {
    const { hospital, blood_group, donation_date, status, notes } = req.body || {};
    if (!hospital || typeof hospital !== 'string' || !hospital.trim()) {
      return res.status(400).json({ error: 'INVALID_HOSPITAL', message: 'Hospital or center name is required.' });
    }

    const cleanBlood = BLOOD_GROUPS.includes(blood_group) ? blood_group : 'O+';
    const cleanStatus = status === 'scheduled' ? 'scheduled' : 'completed';
    const cleanDate =
      typeof donation_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(donation_date)
        ? donation_date
        : new Date().toISOString().slice(0, 10);

    const { data, error } = await req.supabase
      .from('donations')
      .insert({
        user_id: req.user.id,
        hospital: hospital.trim(),
        blood_group: cleanBlood,
        donation_date: cleanDate,
        status: cleanStatus,
        notes: typeof notes === 'string' ? notes.trim() : '',
      })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: 'DONATION_INSERT_FAILED', message: error.message });
    }

    return res.status(201).json({ donation: data });
  } catch (err) {
    console.error('Donation insert error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to save donation' });
  }
});

app.patch('/api/donations/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (status !== 'completed' && status !== 'scheduled') {
      return res.status(400).json({ error: 'INVALID_STATUS', message: 'Invalid status.' });
    }

    const { data, error } = await req.supabase
      .from('donations')
      .update({ status })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: 'DONATION_UPDATE_FAILED', message: error.message });
    }

    return res.json({ donation: data });
  } catch (err) {
    console.error('Donation update error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to update donation' });
  }
});

app.delete('/api/donations/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await req.supabase
      .from('donations')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: 'DONATION_DELETE_FAILED', message: error.message });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Donation delete error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to cancel donation' });
  }
});

/* ---------- Blood Requests & Notifications API ---------- */

app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('blood_requests')
      .select('*')
      .or(`donor_id.eq.${req.user.id},requester_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: 'NOTIFICATIONS_QUERY_FAILED', message: error.message });
    }

    return res.json({ notifications: data || [] });
  } catch (err) {
    console.error('Notifications fetch error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to load notifications' });
  }
});

app.post('/api/requests', requireAuth, async (req, res) => {
  try {
    const { donor_id, blood_group, wilaya, message } = req.body || {};
    if (!donor_id) {
      return res.status(400).json({ error: 'MISSING_DONOR', message: 'Donor ID is required.' });
    }

    const profile = await ensureProfile(req.supabase, req.user);
    const cleanBlood = BLOOD_GROUPS.includes(blood_group) ? blood_group : profile.blood_group || 'O+';

    const { data, error } = await req.supabase
      .from('blood_requests')
      .insert({
        requester_id: req.user.id,
        donor_id,
        requester_name: profile.full_name,
        requester_phone: profile.phone || '',
        blood_group: cleanBlood,
        wilaya: typeof wilaya === 'string' && wilaya.trim() ? wilaya.trim() : profile.wilaya || 'Alger',
        message: typeof message === 'string' ? message.trim() : '',
      })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: 'REQUEST_FAILED', message: error.message });
    }

    return res.status(201).json({ request: data });
  } catch (err) {
    console.error('Blood request error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to send request' });
  }
});

app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await req.supabase
      .from('blood_requests')
      .update({ is_read: true })
      .eq('id', id)
      .eq('donor_id', req.user.id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: 'MARK_READ_FAILED', message: error.message });
    }

    return res.json({ notification: data });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Failed to mark notification as read' });
  }
});

/* ---------- Free OpenStreetMap Geocoding API (No API Key Required) ---------- */

app.get('/api/geocode', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const lang = ['fr', 'en', 'ar'].includes(String(req.query.lang)) ? String(req.query.lang) : 'fr';
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'INVALID_QUERY', results: [] });
    }

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', q);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '5');
    url.searchParams.set('countrycodes', 'dz');
    url.searchParams.set('accept-language', lang);

    const r = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'BAK-BloodDonationApp/1.0 (https://github.com/nexaamdz-art/BAK)',
      },
    });
    if (!r.ok) {
      return res.status(502).json({ error: 'GEOCODE_FAILED', results: [] });
    }
    const items = await r.json();
    const results = (Array.isArray(items) ? items : []).map((item) => ({
      name: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
    })).filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lng));

    return res.json({ results });
  } catch (err) {
    console.error('Geocode error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', results: [] });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    supabaseConfigured: isSupabaseConfigured(),
    hasUrl: Boolean(getSupabaseUrl()),
    hasKey: Boolean(getSupabaseKey()),
  });
});

/* ---------- Static Frontend & SPA Fallback ---------- */

app.use(express.static(STATIC_DIR));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'API route not found' });
  }
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BAK server listening on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
