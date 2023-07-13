import {
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { getLayout as getSiteLayout } from ".";
import { useAppRouter } from "../hooks/useRouter";
import Link from "next/link";
export const BreadcumpLayout = (props: any) => {
  const [path, setPath] = useState<String[]>([]);
  const router = useAppRouter();
  React.useEffect(() => {
    setPath(router.nextRouter.asPath.split("/").slice(1, -1));
  }, [router.nextRouter.asPath]);

  return (
    <Flex
      id="AppContainer"
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
            <Link href="/" passHref shallow>
              <BreadcrumbLink as={"div"} textTransform={"capitalize"}>
                Home
              </BreadcrumbLink>
            </Link>
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
              <Link
                passHref={true}
                shallow
                href={{ pathname: linkPath, query: { ...query } }}
              >
                <BreadcrumbLink
                  as={"div"}
                  isCurrentPage={idx === path.length ? true : false}
                  fontWeight={idx === path.length - 1 ? "semibold" : "normal"}
                  textTransform={"capitalize"}
                >
                  {element}
                </BreadcrumbLink>
              </Link>
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
      {props.children}
    </Flex>
  );
};

export const getLayout = (page: any) =>
  getSiteLayout(<BreadcumpLayout>{page}</BreadcumpLayout>);
