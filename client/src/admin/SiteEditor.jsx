import { Plus, Trash2 } from 'lucide-react';
import { ImageField, Section, TextField } from './fields.jsx';

// Immutable update of a nested value, e.g. setIn(site, ['hero', 'image'], url)
export function setIn(obj, [key, ...rest], value) {
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[key] = rest.length ? setIn(obj[key], rest, value) : value;
  return copy;
}

export default function SiteEditor({ site, onChange, token }) {
  const bind = (...path) => ({
    value: path.reduce((v, k) => v?.[k], site),
    onChange: (value) => onChange(setIn(site, path, value)),
  });

  return (
    <div className="space-y-6">
      <Section title="Restaurant name & logo" description="Shown in the top bar, footer, browser tab and booking confirmations.">
        <TextField label="Restaurant name" maxLength={80} {...bind('name')} />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Logo — big word" hint="e.g. PAHADI" maxLength={30} {...bind('logoTitle')} />
          <TextField label="Logo — small line" hint="e.g. Dhaba & Cafe" maxLength={40} {...bind('logoSubtitle')} />
        </div>
        <TextField label="City" hint="Used in headings like “Find us in …” and to help directions." maxLength={60} {...bind('city')} />
        <TextField label="Short description (footer)" multiline maxLength={600} {...bind('description')} />
      </Section>

      <Section title="Top banner" description="The first thing visitors see.">
        <ImageField label="Background photo" hint="Wide landscape photos work best (at least 1600 px wide)." token={token} {...bind('hero', 'image')} />
        <TextField label="Small badge above the title" maxLength={80} {...bind('hero', 'badge')} />
        <div className="grid sm:grid-cols-3 gap-4">
          <TextField label="Title — first line" maxLength={60} {...bind('hero', 'titleTop')} />
          <TextField label="Title — highlighted line" maxLength={60} {...bind('hero', 'titleHighlight')} />
          <TextField label="Title — last line" maxLength={60} {...bind('hero', 'titleBottom')} />
        </div>
        <TextField label="Intro text" multiline maxLength={400} {...bind('hero', 'text')} />
        <TextField label="Highlight in the info bar" hint="Leave empty to hide." maxLength={80} {...bind('hero', 'highlight')} />
      </Section>

      <Section title="Contact, address & hours">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Phone number" hint="Visitors can tap it to call." maxLength={25} {...bind('phone')} />
          <TextField label="Price per person" maxLength={40} {...bind('priceRange')} />
        </div>
        <TextField label="Address" hint="One line per row." multiline rows={3} maxLength={300} {...bind('address')} />
        <TextField
          label="Google Maps search text"
          hint="What the map and “Get Directions” search for. Use the name exactly as it appears on Google Maps."
          maxLength={300}
          {...bind('mapQuery')}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Open days" maxLength={60} {...bind('hours', 'days')} />
          <TextField label="Opening hours" maxLength={60} {...bind('hours', 'time')} />
        </div>
        <TextField label="Nearby landmarks" multiline maxLength={400} {...bind('landmarks')} />
        <TextField label="Parking" multiline maxLength={400} {...bind('parking')} />
      </Section>

      <Section title="Ratings & links">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Google rating (0–5)" type="number" {...bind('rating')} />
          <TextField label="Number of reviews" type="number" {...bind('reviewCount')} />
        </div>
        <TextField label="Full menu PDF link" hint="Leave empty to hide the “View Full Menu” button." {...bind('menuPdfUrl')} placeholder="https://…" />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Instagram link" {...bind('social', 'instagram')} placeholder="https://instagram.com/…" />
          <TextField label="Facebook link" {...bind('social', 'facebook')} placeholder="https://facebook.com/…" />
        </div>
      </Section>

      <Section title="Overview photos" description="The four photos next to “Our Signature Dhaba & Cafe Menu”.">
        <div className="grid sm:grid-cols-2 gap-5">
          {site.aboutPhotos.map((_, i) => (
            <div key={i} className="space-y-2">
              <ImageField label={`Photo ${i + 1}`} compact token={token} {...bind('aboutPhotos', i, 'src')} />
              <TextField label="Description" maxLength={120} {...bind('aboutPhotos', i, 'alt')} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Seating photos">
        <div className="grid sm:grid-cols-2 gap-5">
          <ImageField label="Outdoor Hill Cabana" compact token={token} {...bind('cabanaPhotos', 'outdoor')} />
          <ImageField label="Royal AC Dining Hall" compact token={token} {...bind('cabanaPhotos', 'hall')} />
        </div>
      </Section>

      <Section title="Gallery" description="The first photo is shown large. Up to 12 photos.">
        <div className="grid sm:grid-cols-2 gap-5">
          {site.gallery.map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-brand-brown/10 p-3">
              <ImageField label={i === 0 ? 'Photo 1 (large)' : `Photo ${i + 1}`} compact token={token} {...bind('gallery', i, 'src')} />
              <TextField label="Description" maxLength={120} {...bind('gallery', i, 'alt')} />
              {site.gallery.length > 1 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...site, gallery: site.gallery.filter((__, j) => j !== i) })}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {site.gallery.length < 12 && (
          <button
            type="button"
            onClick={() => onChange({ ...site, gallery: [...site.gallery, { src: '', alt: '' }] })}
            className="inline-flex items-center gap-2 border-2 border-brand-orange text-brand-orange px-4 py-2 rounded-lg font-semibold hover:bg-brand-orange hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" /> Add photo
          </button>
        )}
      </Section>
    </div>
  );
}
