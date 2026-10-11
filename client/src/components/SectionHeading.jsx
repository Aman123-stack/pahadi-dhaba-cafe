export default function SectionHeading({ eyebrow, eyebrowClass = 'bg-brand-orange/10 text-brand-orange', title, highlight, children, aos = true }) {
  return (
    <div className="text-center mb-16" {...(aos ? { 'data-aos': 'fade-up' } : {})}>
      <span className={`inline-block ${eyebrowClass} px-6 py-2 rounded-full text-sm font-bold mb-4 uppercase tracking-wider`}>
        {eyebrow}
      </span>
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6">
        {title}
        {highlight && (
          <>
            <br />
            <span className="text-brand-orange">{highlight}</span>
          </>
        )}
      </h2>
      {children && <p className="text-xl text-brand-brown/70 max-w-2xl mx-auto">{children}</p>}
    </div>
  );
}
