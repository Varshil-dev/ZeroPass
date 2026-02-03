import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, typography, borderRadius } from '../theme/theme';

// Button Component
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    };

    // Size variants
    const sizeStyles = {
      small: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
      medium: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
      large: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: theme.accent.primary,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.accent.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: theme.accent.danger,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const variantTextStyles = {
      primary: { color: theme.text.inverse },
      secondary: { color: theme.accent.primary },
      ghost: { color: theme.text.primary },
      danger: { color: theme.text.inverse },
    };

    return {
      ...typography.button,
      ...variantTextStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? theme.text.inverse : theme.accent.primary}
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
}) => {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    };

    const variantStyles = {
      default: {
        backgroundColor: theme.background.secondary,
      },
      elevated: {
        backgroundColor: theme.background.elevated,
        shadowColor: theme.shadow.md,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 4,
      },
      outlined: {
        backgroundColor: theme.background.secondary,
        borderWidth: 1,
        borderColor: theme.border.primary,
      },
      glass: {
        backgroundColor: theme.glass.background,
        borderWidth: 1,
        borderColor: theme.glass.border,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[getCardStyle(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
    >
      {children}
    </Component>
  );
};

// Progress Bar Component
interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 6,
  color,
  backgroundColor,
  animated = true,
  style,
}) => {
  const { theme } = useTheme();
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: progress,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress]);

  return (
    <View
      style={[
        {
          height,
          backgroundColor: backgroundColor || theme.border.primary,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          backgroundColor: color || theme.accent.primary,
          borderRadius: height / 2,
          width: animatedWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  );
};

// Badge Component
interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'neutral',
  size = 'medium',
  style,
}) => {
  const { theme } = useTheme();

  const variantColors = {
    success: theme.accent.success,
    warning: theme.accent.warning,
    danger: theme.accent.danger,
    info: theme.accent.primary,
    neutral: theme.text.tertiary,
  };

  const sizeStyles = {
    small: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      fontSize: 10,
    },
    medium: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 12,
    },
  };

  return (
    <View
      style={[
        {
          backgroundColor: variantColors[variant] + '20',
          borderRadius: borderRadius.full,
          alignSelf: 'flex-start',
          ...sizeStyles[size],
        },
        style,
      ]}
    >
      <Text
        style={{
          color: variantColors[variant],
          fontWeight: '600',
          fontSize: sizeStyles[size].fontSize,
        }}
      >
        {text}
      </Text>
    </View>
  );
};

// Status Indicator Component
interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'warning';
  text?: string;
  size?: number;
  style?: ViewStyle;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  text,
  size = 8,
  style,
}) => {
  const { theme } = useTheme();

  const statusColors = {
    active: theme.accent.success,
    inactive: theme.text.tertiary,
    warning: theme.accent.warning,
  };

  const animatedScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedScale, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [status]);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: statusColors[status],
          transform: [{ scale: status === 'active' ? animatedScale : 1 }],
        }}
      />
      {text && (
        <Text
          style={{
            ...typography.bodySmall,
            color: theme.text.secondary,
            fontWeight: '600',
          }}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

// Input Component
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  onKeyPress?: () => void;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoFocus = false,
  onKeyPress,
  style,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View
      style={[
        {
          backgroundColor: theme.background.tertiary,
          borderWidth: 2,
          borderColor: isFocused ? theme.border.focus : theme.border.primary,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          minHeight: multiline ? 100 : 48,
        },
        style,
      ]}
    >
      <Text
        style={{
          ...typography.body,
          color: theme.text.primary,
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {value || placeholder}
      </Text>
    </View>
  );
};