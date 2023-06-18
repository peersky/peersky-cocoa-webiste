import {
  Container,
  SimpleGrid,
  Image,
  Flex,
  Heading,
  Text,
  Stack,
  StackDivider,
  Icon,
  useColorModeValue,
  Button,
  useBreakpointValue,
  useToken,
  chakra,
  ChakraProps,
  ChakraComponent,
  ButtonProps,
  color,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { FaDiscord, FaGithubSquare } from "react-icons/fa";
import RouteButton from "./RouteButton";
import useRouter from "../hooks/useRouter";
import UIContext from "../providers/UIProvider/context";
import { IconType } from "react-icons";

interface CallToAction {
  label: string;
  colorScheme?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
interface Bullet {
  text: string;
  bgColor: string;
  icon: IconType;
  color: string;
  bullets?: Bullet[];
}
const Feature = ({
  text,
  icon,
  iconBg,
  bullets,
}: {
  text: string;
  icon?: React.ReactNode;
  iconBg: string;
  bullets?: Bullet[];
}) => {
  return (
    <Flex direction="column">
      <Stack direction={"row"} align={"center"}>
        {icon && (
          <Flex
            w={8}
            maxW={8}
            maxH={8}
            h={8}
            flexShrink={0}
            align={"center"}
            justify={"center"}
            rounded={"full"}
            bg={iconBg}
          >
            {icon && icon}
          </Flex>
        )}
        <Text fontWeight={600}>{text}</Text>
      </Stack>
      {bullets && bullets?.length > 0 && (
        <Stack pt={8} pl={8} direction={"column"} spacing={2}>
          {bullets.map((bullet, idx) => {
            return (
              <Feature
                key={`nested-bullet-${idx}-${bullet.text}`}
                iconBg={bullet.bgColor}
                // text={bullet.text}
                {...bullet}
                icon={
                  <Icon as={bullet.icon} color={bullet.color} w={16} h={16} />
                }
              />
            );
          })}
        </Stack>
      )}
    </Flex>
  );
};

const _SplitWithImage = ({
  badge,
  title,
  body,
  bullets,
  colorScheme,
  imgURL,
  mirror,
  elementName,
  cta,
  socialButton,
  imgBoxShadow,
  py,
  ...props
}: {
  badge?: string;
  title?: string;
  body: string;
  bullets?: {
    text: string;
    bgColor: string;
    icon?: IconType;
    color: string;
    bullets?: Bullet[];
  }[];
  colorScheme: string;
  imgURL: string;
  mirror?: boolean;
  elementName?: string;
  cta?: CallToAction;
  socialButton?: { icon: string; title: string; url: string };
  imgBoxShadow?: string;
  py?: string;
}) => {
  const router = useRouter();

  var buttonSize = useBreakpointValue({
    base: { single: "sm", double: "xs" },
    sm: { single: "md", double: "sm" },
    md: { single: "md", double: "sm" },
    lg: { single: "lg", double: "lg" },
    xl: { single: "lg", double: "lg" },
    "2xl": { single: "lg", double: "lg" },
  });

  const ui = useContext(UIContext);

  const [isVisible, setVisible] = React.useState(true);
  const domRef = React.useRef(null);
  // React.useEffect(() => {
  //   const observer = new IntersectionObserver((entries) => {
  //     entries.forEach((entry) => setVisible(entry.isIntersecting));
  //   });
  //   let current = domRef.current;
  //   if (domRef.current) {
  //     observer.observe(domRef.current);
  //   }

  //   return () => current && observer.unobserve(current);
  // }, [domRef.current]);

  const [theme100, theme200, theme300, theme900] = useToken(
    // the key within the theme, in this case `theme.colors`
    "colors",
    // the subkey(s), resolving to `theme.colors.red.100`
    [
      `${colorScheme}.100`,
      `${colorScheme}.200`,
      `${colorScheme}.300`,
      `${colorScheme}.900`,
    ]
    // a single fallback or fallback array matching the length of the previous arg
  );

  return (
    <Container
      maxW={"100%"}
      py={py}
      className={`fade-in-section ${isVisible ? "is-visible" : ""}`}
      ref={domRef}
      {...props}
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={[0, 0, 10, null, 10]}>
        {mirror && !ui.isMobileView && (
          <Flex>
            <Image
              rounded={"md"}
              alt={"feature image"}
              src={imgURL}
              objectFit={"contain"}
              boxShadow={imgBoxShadow ?? "inherit"}
              height="auto"
            />
          </Flex>
        )}
        <Stack spacing={[2, 4]} justifyContent="center">
          {badge && (
            <Stack direction="row" placeContent={"flex-start"}>
              <Text
                id={`MoonBadge ${elementName}`}
                textTransform={"uppercase"}
                color={"white.100"}
                fontWeight={600}
                fontSize={["xs", "sm"]}
                sx={{
                  background: `linear-gradient(to bottom, ${theme100} 0%,${theme100} 15%,${theme200} 19%,${theme300} 20%,${theme900} 50%,${theme300} 80%,${theme200} 81%,${theme100} 85%,${theme100} 100%);`,
                }}
                p={[1, 2]}
                rounded={"md"}
              >
                {badge}
              </Text>
            </Stack>
          )}
          <Heading size="md">{title}</Heading>
          <Text color={`${color}.500`} fontSize={["sm", "md", "lg"]}>
            {body}
          </Text>
          <Stack
            spacing={4}
            divider={
              <StackDivider
                borderColor={useColorModeValue("gray.100", "gray.700")}
              />
            }
          >
            {bullets?.map((bullet, idx) => {
              return (
                <Feature
                  key={`splitWImageBullet-${idx}-${title}`}
                  icon={
                    bullet.icon && (
                      <Icon
                        as={bullet.icon}
                        color={bullet.color}
                        w={16}
                        h={16}
                      />
                    )
                  }
                  iconBg={bullet.bgColor}
                  text={bullet.text}
                  bullets={bullet?.bullets}
                />
              );
            })}

            <Flex
              w="100%"
              flexWrap="nowrap"
              display={["column", "column", null, "row"]}
            >
              {socialButton && (
                <RouteButton
                  isExternal
                  w={["100%", "100%", "fit-content", null]}
                  maxW={["250px", null, "fit-content"]}
                  href={socialButton.url}
                  // onClick={() => {
                  //   if (mixpanel.get_distinct_id()) {
                  //     mixpanel.track(`${MIXPANEL_EVENTS.BUTTON_CLICKED}`, {
                  //       full_url: router.nextRouter.asPath,
                  //       buttonName: `${socialButton.title}`,
                  //       page: `splitWImage`,
                  //       section: `${badge}`,
                  //     });
                  //   }
                  // }}
                  mt={[0, 0, null, 16]}
                  size={
                    !!buttonSize
                      ? socialButton
                        ? buttonSize.double
                        : buttonSize.single
                      : "md"
                  }
                  variant="outline"
                  colorScheme={colorScheme}
                  leftIcon={
                    (socialButton.icon == "github" && <FaGithubSquare />) ||
                    (socialButton.icon == "discord" && <FaDiscord />)
                  }
                >
                  {socialButton.title}
                </RouteButton>
              )}
              {cta && (
                <Button
                  colorScheme={cta.colorScheme ?? colorScheme}
                  w={["100%", "100%", "fit-content", null]}
                  maxW={["250px", null, "fit-content"]}
                  variant="outline"
                  mt={[0, 0, null, 16]}
                  size={
                    !!buttonSize
                      ? socialButton
                        ? buttonSize.double
                        : buttonSize.single
                      : "md"
                  }
                  onClick={cta.onClick}
                  // onClick={() => {
                  //   if (mixpanel.get_distinct_id()) {
                  //     mixpanel.track(`${MIXPANEL_EVENTS.BUTTON_CLICKED}`, {
                  //       full_url: router.nextRouter.asPath,
                  //       buttonName: `${cta.label}`,
                  //       page: `splitWImage`,
                  //       section: `${badge}`,
                  //     });
                  //   }

                  //   cta.onClick();
                  // }}
                >
                  {cta.label}
                </Button>
              )}
            </Flex>
          </Stack>
        </Stack>
        {(!mirror || ui.isMobileView) && (
          <Flex justifyContent="center" alignItems="center">
            <Image
              rounded={"md"}
              alt={"feature image"}
              src={imgURL}
              objectFit={"contain"}
              h="auto"
              boxShadow={imgBoxShadow ?? "inherit"}
            />
          </Flex>
        )}
      </SimpleGrid>
    </Container>
  );
};
const SplitWithImage = chakra(_SplitWithImage);

export default SplitWithImage;
