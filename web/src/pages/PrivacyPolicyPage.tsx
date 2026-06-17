import LegalPageLayout from './LegalPageLayout';

const Section = ({ heading, children }: { heading: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-lg font-display font-semibold text-foreground tracking-wide">{heading}</h2>
    {children}
  </section>
);

const PrivacyPolicyPage = () => (
  <LegalPageLayout title="Privacy Policy" lastUpdated="June 18, 2026">
    <p>
      This Privacy Policy explains how Minzzle ("we", "us", "our") collects, uses, and protects
      your information when you use the puzzle games and related services available at minzzle.com
      (the "Service").
    </p>

    <Section heading="Information We Collect">
      <p>When you sign in with a social login provider (Google, Microsoft, or Facebook), we receive
        and store the following information from that provider:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Your name and email address</li>
        <li>A unique account identifier provided by the login provider</li>
        <li>Your profile picture, where made available</li>
      </ul>
      <p>We also store gameplay data you generate while using the Service, such as level progress
        and completion records.</p>
    </Section>

    <Section heading="How We Use Your Information">
      <ul className="list-disc pl-6 space-y-1">
        <li>To create and maintain your account</li>
        <li>To save and sync your game progress across sessions and devices</li>
        <li>To operate, maintain, and improve the Service</li>
        <li>To protect against fraud, abuse, and unauthorized access</li>
      </ul>
    </Section>

    <Section heading="How We Share Your Information">
      <p>We do not sell your personal information. We do not share your personal information with
        third parties except as necessary to operate the Service (for example, our hosting provider)
        or where required by law.</p>
    </Section>

    <Section heading="Data Retention">
      <p>We retain your account and gameplay data for as long as your account is active. You may
        request deletion of your account and associated data at any time by contacting us.</p>
    </Section>

    <Section heading="Your Rights">
      <p>You may request access to, correction of, or deletion of your personal data. To do so,
        contact us using the details below and we will respond within a reasonable timeframe.</p>
    </Section>

    <Section heading="Cookies">
      <p>We use a session cookie to keep you signed in. This cookie is required for authentication
        and is not used for advertising or third-party tracking.</p>
    </Section>

    <Section heading="Children's Privacy">
      <p>The Service is not directed to children under 13, and we do not knowingly collect personal
        information from children under 13.</p>
    </Section>

    <Section heading="Changes to This Policy">
      <p>We may update this Privacy Policy from time to time. Material changes will be reflected by
        updating the "Last updated" date above.</p>
    </Section>

    <Section heading="Contact Us">
      <p>If you have questions about this Privacy Policy, contact us at{' '}
        <a href="mailto:alextykoun@gmail.com" className="text-primary underline hover:text-primary/90">
          alextykoun@gmail.com
        </a>.
      </p>
    </Section>
  </LegalPageLayout>
);

export default PrivacyPolicyPage;
