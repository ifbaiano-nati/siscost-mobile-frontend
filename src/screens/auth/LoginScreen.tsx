import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = '#1976d2';
const ALERT_COLOR = '#d32f2f'; // Vermelho para erro
const NEUTRAL_LIGHT = '#f0f0f0'; // Fundo suave para inputs

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login } = useAuth();
  const navigation = useNavigation();

  const validateEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email || !validateEmail(email)) {
      setEmailError('Email inválido');
      return;
    }

    if (!password) {
      setPasswordError('Senha não pode ser vazia');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Dados de login inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER: FOCO TOTAL NA LOGO */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/logoCompleta.png')}
              style={styles.logo}
              contentFit="contain"
              transition={200}
            />
          </View>

          <View style={styles.form}>
            {/* INPUT E-MAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
                <Icon name="email-outline" size={20} color={emailError ? ALERT_COLOR : '#666'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* INPUT SENHA */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
                <Icon name="lock-outline" size={20} color={passwordError ? ALERT_COLOR : '#666'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* BOTÃO DE LOGIN */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>ENTRAR</Text>
              )}
            </TouchableOpacity>

            {/* LINKS DE AÇÃO */}
            <View style={styles.linksContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword' as never)}
              >
                <Text style={styles.forgotLinkText}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </View>

            {/* REGISTRO SIMPLIFICADO: Link discreto no rodapé */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={styles.registerLinkBaseText}>Ainda não tem conta? </Text>
              <Text style={styles.registerLinkHighlightText}>
                Registre-se aqui
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: NEUTRAL_LIGHT,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: '100%',
    height: 120,
    marginBottom: 5,
  },
  // 🚨 REMOVIDO: welcome style
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: NEUTRAL_LIGHT,
    elevation: 1,
  },
  inputWrapperError: {
    borderColor: ALERT_COLOR,
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#000',
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    color: ALERT_COLOR,
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  linksContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotLinkText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerLink: {
    marginTop: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerLinkBaseText: {
    color: '#666',
    fontSize: 16,
  },
  registerLinkHighlightText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});