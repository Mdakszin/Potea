import { useWindowDimensions, Platform } from 'react-native';

export const BREAKPOINTS = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    largeDesktop: 1440,
};

export const useResponsive = () => {
    const { width, height } = useWindowDimensions();

    const isMobile = width < BREAKPOINTS.tablet;
    const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    const isDesktop = width >= BREAKPOINTS.desktop;
    const isLargeDesktop = width >= BREAKPOINTS.largeDesktop;

    const getColumns = (mobile = 2, tablet = 3, desktop = 4, large = 5) => {
        if (isLargeDesktop) return large;
        if (isDesktop) return desktop;
        if (isTablet) return tablet;
        return mobile;
    };

    const contentMaxWidth = isLargeDesktop ? 1400 : isDesktop ? 1200 : isTablet ? 740 : width;

    return {
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        getColumns,
        contentMaxWidth,
        isWeb: Platform.OS === 'web',
    };
};
