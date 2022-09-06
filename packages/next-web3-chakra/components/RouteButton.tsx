import React from "react";
import { chakra, Button, Link } from "@chakra-ui/react";
import NextLink from "next/link";

const _RouteButton = (props: any) => {
  return (
    <NextLink href={props.href} passHref>
      <Button as={Link} {...props}>
        {props.children}
      </Button>
    </NextLink>
  );
};

const RouteButton = chakra(_RouteButton, {label:"button"});

export default RouteButton;
