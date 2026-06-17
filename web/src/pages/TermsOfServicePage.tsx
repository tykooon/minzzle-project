import LegalPageLayout from './LegalPageLayout';

const Section = ({ heading, children }: { heading: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-lg font-display font-semibold text-foreground tracking-wide">{heading}</h2>
    {children}
  </section>
);

const TermsOfServicePage = () => (
  <LegalPageLayout title="Terms of Service" lastUpdated="June 18, 2026">
    <p>
      These Terms of Service ("Terms") govern your access to and use of the puzzle games and related
      services available at minzzle.com (the "Service"). By using the Service, you agree to these Terms.
    </p>

    <Section heading="Accounts">
      <p>You may sign in using a supported social login provider (Google, Microsoft, or Facebook).
        You are responsible for activity that occurs under your account. You must provide accurate
        information and keep your login credentials secure.</p>
    </Section>

    <Section heading="Acceptable Use">
      <p>You agree not to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Use the Service for any unlawful purpose</li>
        <li>Attempt to disrupt, overload, or gain unauthorized access to the Service</li>
        <li>Reverse engineer or interfere with the operation of the Service</li>
        <li>Use automated means to access the Service in a way that harms its operation</li>
      </ul>
    </Section>

    <Section heading="Intellectual Property">
      <p>The Service, including its games, design, and content, is owned by Minzzle and protected by
        applicable intellectual property laws. You are granted a limited, non-exclusive, revocable
        license to use the Service for personal, non-commercial purposes.</p>
    </Section>

    <Section heading="Service Availability">
      <p>The Service is provided on an "as is" and "as available" basis. We do not guarantee that the
        Service will be uninterrupted, error-free, or that game progress will always be preserved.</p>
    </Section>

    <Section heading="Termination">
      <p>We may suspend or terminate your access to the Service at any time if you violate these Terms
        or if we discontinue the Service. You may stop using the Service at any time.</p>
    </Section>

    <Section heading="Limitation of Liability">
      <p>To the maximum extent permitted by law, Minzzle shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of the Service.</p>
    </Section>

    <Section heading="Changes to These Terms">
      <p>We may update these Terms from time to time. Continued use of the Service after changes take
        effect constitutes acceptance of the updated Terms.</p>
    </Section>

    <Section heading="Contact Us">
      <p>If you have questions about these Terms, contact us at{' '}
        <a href="mailto:alextykoun@gmail.com" className="text-primary underline hover:text-primary/90">
          alextykoun@gmail.com
        </a>.
      </p>
    </Section>
  </LegalPageLayout>
);

export default TermsOfServicePage;
