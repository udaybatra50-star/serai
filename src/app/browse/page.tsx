import { redirect } from 'next/navigation'

// Public /browse redirects to the retailer browse page
// If not authenticated, proxy will redirect to signin
export default function BrowseRedirect() {
  redirect('/retailer/browse')
}
