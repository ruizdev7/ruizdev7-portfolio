import React from "react";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-lg p-6 w-[1200px] h-[800px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Terms and Conditions of Use
          </h2>
          <p>
            <strong>Last Updated:</strong> Thu, 7 November 2024
          </p>
          <br />
          <p>
            Welcome to my Personal Portfolio. By accessing this website, you
            agree to these terms and conditions. Please read them carefully.
          </p>
          <br />
          <h2>
            <strong>1. General Terms</strong>
          </h2>
          <p>
            This website is provided for informational purposes and to showcase
            the work of Joseph Ruiz, a{" "}
            <strong>Software Engineer | DevOps Engineer</strong> based in
            Europe. You agree to use this website lawfully and not to misuse or
            damage it.
          </p>
          <br />
          <h2>
            <strong>2. Data Collection and Purpose</strong>
          </h2>
          <p>We collect certain personal information, such as:</p>
          <br />

          <ol>
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Physical Address</li>
            <li>Nationality</li>
            <li>State/Province</li>
            <li>City</li>
            <li>Zip/Postal Code</li>
          </ol>

          <br />

          <p>
            <strong>Purpose of Data Collection:</strong> This information is
            solely used for contacting purposes and to personalize your
            experience on this site. No personal data is sold or monetized.
          </p>

          <br />

          <h2>
            <strong>3. Data Processing and Storage</strong>
          </h2>
          <p>
            All data is processed and stored securely in compliance with GDPR
            requirements. Data will only be stored for as long as necessary to
            fulfill the purposes mentioned above, after which it will be deleted
            or anonymized.
          </p>
          <br />
          <h2>
            <strong>4. User Rights</strong>
          </h2>
          <p>
            Under the General Data Protection Regulation (GDPR), users in the EU
            have the following rights:
          </p>
          <br />
          <ul>
            <li>
              <strong>Right to Access:</strong> You may request access to your
              personal data.
            </li>
            <li>
              <strong>Right to Rectification:</strong> You may request
              corrections to inaccurate or incomplete personal data.
            </li>
            <li>
              <strong>Right to Erasure:</strong> You may request deletion of
              your personal data, subject to certain legal limitations.
            </li>
            <li>
              <strong>Right to Restrict Processing:</strong> You can request
              limitations on how your data is used.
            </li>
          </ul>
          <br />
          <p>
            To exercise any of these rights, please contact us using the details
            below.
          </p>
          <br />
          <h2>
            <strong>5. Data Sharing and Third-Party Services</strong>
          </h2>
          <p>
            Your data will not be shared with third parties except as required
            by law or with your explicit consent.
          </p>
          <br />
          <h2>
            <strong>6. Changes to Terms</strong>
          </h2>
          <p>
            We may update these Terms and Conditions from time to time. When
            significant changes are made, we will notify users by posting an
            announcement on the website or through other means.
          </p>
          <br />
          <h2>
            <strong>7. Contact Information</strong>
          </h2>
          <p>
            If you have any questions about these Terms and Conditions or wish
            to exercise any of your rights under GDPR, please contact us at:
          </p>
          <br />
          <p>
            <strong>Email:</strong> ruizdev7@outlook.com
            <br />
            <strong>Address:</strong> UL. Zielona 25, Kostrzyn nad Odrą, Poland
            <br />
            <strong>Phone:</strong> +48 500866813
          </p>
          <br />
          <div className="flex flex-col items-center gap-4 p-2">
            <span className="flex items-center gap-2">
              {" "}
              <Link
                to="/auth/sign-up"
                className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
              >
                I have read terms and conditions
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
