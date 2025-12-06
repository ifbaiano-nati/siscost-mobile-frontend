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
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

const PRIMARY_COLOR = '#1976d2';
const ALERT_COLOR = '#d32f2f'; // Vermelho para erro
const NEUTRAL_LIGHT = '#f0f0f0'; // Fundo suave para inputs

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const navigation = useNavigation();

  const validateEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleSubmit = async () => {
    setEmailError('');

    if (!email || !validateEmail(email)) {
      setEmailError('Email inválido. Verifique o formato.');
      return;
    }

    try {
      setLoading(true);
      // Simulação de sucesso (manter para teste de UI)
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Sucesso',
        'Enviamos um link para redefinição da sua senha por email. Favor verifique sua caixa postal.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', 'Não conseguimos processar a solicitação. Verifique seu e-mail e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // 🚨 NOVO: Fundo branco para a área principal 🚨
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER COM LOGO E MENSAGEM */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/logoCompleta.png')}
              style={styles.logo}
              contentFit="contain"
              transition={200}
            />

          </View>

          {/* CARD DO FORMULÁRIO */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Redefinir Senha</Text>
            <Text style={styles.subtitle}>
              Digite seu e-mail de cadastro e nós enviaremos um link de redefinição.
            </Text>
            <View style={styles.form}>
              {/* INPUT E-MAIL COM ÍCONE E NOVO ESTILO */}
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

              {/* BOTÃO DE ENVIAR */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>ENVIAR LINK</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* VOLTAR PARA LOGIN - Link abaixo do Card */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            {/* 🚨 CORREÇÃO: Cor do link para contrastar com o fundo cinza claro 🚨 */}
            <Text style={styles.linkText}>Voltar para o Login</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff', // Fundo branco no topo
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: NEUTRAL_LIGHT, // Fundo cinza claro para o conteúdo
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: '90%',
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR, // Mantém a cor primária
    marginBottom: 12,
    marginTop: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'justify',
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor:'#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
  },
  // Card Branco para o Formulário
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    width: '100%',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
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
    backgroundColor: NEUTRAL_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: NEUTRAL_LIGHT,
  },
  inputWrapperError: {
    borderColor: ALERT_COLOR,
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
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
    marginTop: 10,
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
  linkButton: {
    marginTop: 25,
    alignItems: 'center',
  },
  linkText: {
    color: PRIMARY_COLOR, // Cor primária no fundo cinza
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});