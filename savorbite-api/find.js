import { supabaseAdmin } from './src/config/supabase.js'
const r = await supabaseAdmin.from('orders').select('*').or('payment_reference.eq.T877956307621295,reference.eq.T877956307621295').maybeSingle()
console.log(JSON.stringify(r.data))
process.exit(0)
