"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "../../lib/firebase-client-provider";

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const { user } = useFirebase();
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.push("/admin");
      }
    }, [user, router]);

    if (!user) {
      return null; // Or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
