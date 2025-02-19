import { Button, View, Text } from 'react-native';
import React, { useMemo, useState } from 'react';
import { Link, Redirect, router, Stack } from 'expo-router';

const Page = () => {
  return (
    <Redirect href="/(auth)/login" />
  );
};

export default Page;