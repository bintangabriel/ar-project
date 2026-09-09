'use client';
import { useLoading } from '../../context/LoadingContext';
import Loading from './Loading';

export default function GlobalLoader() {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <Loading />
    );
}
