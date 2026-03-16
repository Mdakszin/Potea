import { Platform } from 'react-native';
import NativeWrapper from './StripeProviderWrapper.native';
import WebWrapper from './StripeProviderWrapper.web';

const StripeProviderWrapper = Platform.OS === 'web' ? WebWrapper : NativeWrapper;

export default StripeProviderWrapper;
