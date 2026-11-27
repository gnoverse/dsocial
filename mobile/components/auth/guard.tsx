import React from "react";
import { useRouter, useSegments } from "expo-router";
import { useAppSelector } from "@gno/redux";
import { User } from "@gno/types";
import { selectAccount } from "redux/features/accountSlice";
import { SharedSegment } from "app/home/_layout";

interface PropsWithChildren {
  children: React.ReactNode;
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | undefined) {
  const segments = useSegments();
  const router = useRouter();
  const [segment] = useSegments() as [SharedSegment];

  // The network must be selectable before signing in, since the connect request names it.
  const unauthSegments = ["sign-up", "sign-in", "network"];

  React.useEffect(() => {
    const inAuthGroup = segments.length <= 0 || unauthSegments.includes(segments[0]);

    console.log("inAuthGroup", inAuthGroup, segments);
    // If the user is not signed in and the initial segment is not anything in the auth group.
    if (!user && !inAuthGroup) {
      router.replace("/");
    }
  }, [user, segments]);
}

export function Guard(props: PropsWithChildren) {
  const account = useAppSelector(selectAccount);

  useProtectedRoute(account);

  return props.children;
}
