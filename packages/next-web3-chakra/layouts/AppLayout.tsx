import {
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { getLayout as getSiteLayout } from "./RootLayout";
import useRouter from "../hooks/useRouter";
import NextLink from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
const AppLayout = (props: any) => {
  const [path, setPath] = useState<String[]>([]);
  const router = useRouter();
  React.useEffect(() => {
    setPath(router.nextRouter.asPath.split("/").slice(1, -1));
  }, [router.nextRouter.asPath]);

  return (
    <Flex
      // textColor={"grey.700"}
      direction={"column"}
      w="100%"
      minH="100vh"
      px="7%"
    >
      <Breadcrumb
        spacing="8px"
        pt={2}
        separator={<ChevronRightIcon color="grey.500" />}
      >
        {path.length !== 0 && (
          <BreadcrumbItem>
            <BreadcrumbLink textTransform={"capitalize"} href={`/`}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {path?.map((element, idx) => {
          let linkPath = "/";
          path.forEach((value, index) => {
            if (index <= idx) linkPath += value + "/";
          });

          const query =
            linkPath === "/terminus/" && router.query.contractAddress
              ? { contractAddress: router.query.contractAddress }
              : undefined;
          return (
            <BreadcrumbItem key={`bcl-${element}-${idx}`}>
              <NextLink
                passHref
                shallow
                href={{ pathname: linkPath, query: { ...query } }}
              >
                <BreadcrumbLink
                  isCurrentPage={idx === path.length ? true : false}
                  fontWeight={idx === path.length - 1 ? "semibold" : "normal"}
                  textTransform={"capitalize"}
                >
                  {element}
                </BreadcrumbLink>
              </NextLink>
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
      {props.children}
    </Flex>
  );
};

export const getLayout = (page: any) =>
  getSiteLayout(<AppLayout>{page}</AppLayout>);

export default AppLayout;
