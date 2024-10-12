import Head from "next/head";

import { UserSecretsPage } from "@app/views/UserSecretsPage";

export default function UserSecrets() {
  return (
    <>
      <Head>
        <title>User Secrets</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
      </Head>
      <div className="h-full">
        <UserSecretsPage />
      </div>
    </>
  );
}

UserSecrets.requireAuth = true;
