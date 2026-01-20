#!/usr/bin/env python3
"""
NEXO ERP Backend - Health Check Scripts
Automated testing for all microservices in dev/prod environments

Usage:
    python3 health-checks.py                    # Test all services
    python3 health-checks.py --service auth     # Test specific service
    python3 health-checks.py --ci               # CI/CD mode (exit codes)
    python3 health-checks.py --prod             # Production environment
"""

import argparse
import json
import sys
import time
from typing import Dict, List, Optional, Tuple
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class ServiceHealthChecker:
    def __init__(self, base_url: str = "http://localhost:3001", timeout: int = 10):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = self._create_session()

    def _create_session(self) -> requests.Session:
        """Create HTTP session with retry strategy"""
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=0.3,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        return session

    def check_service(self, service_name: str, endpoint: str = "/health") -> Tuple[bool, Dict]:
        """Check health of a specific service"""
        url = f"{self.base_url}/api/v1/{service_name}{endpoint}"

        try:
            start_time = time.time()
            response = self.session.get(url, timeout=self.timeout)
            response_time = time.time() - start_time

            result = {
                'service': service_name,
                'url': url,
                'status_code': response.status_code,
                'response_time': round(response_time * 1000, 2),  # ms
                'healthy': response.status_code == 200,
                'error': None
            }

            if response.status_code == 200:
                try:
                    result['data'] = response.json()
                except:
                    result['data'] = response.text
            else:
                result['error'] = response.text

        except requests.exceptions.RequestException as e:
            result = {
                'service': service_name,
                'url': url,
                'status_code': None,
                'response_time': None,
                'healthy': False,
                'error': str(e)
            }

        return result['healthy'], result

    def check_auth_flow(self) -> Tuple[bool, Dict]:
        """Test complete authentication flow"""
        login_url = f"{self.base_url}/api/v1/auth/login"

        try:
            # Test login
            login_data = {"username": "admin", "password": "password"}
            response = self.session.post(
                login_url,
                json=login_data,
                timeout=self.timeout
            )

            if response.status_code != 200:
                return False, {
                    'service': 'auth',
                    'flow': 'login',
                    'healthy': False,
                    'error': f'Login failed: {response.status_code} - {response.text}'
                }

            login_result = response.json()
            token = login_result.get('access_token')

            if not token:
                return False, {
                    'service': 'auth',
                    'flow': 'login',
                    'healthy': False,
                    'error': 'No access token in login response'
                }

            # Test profile endpoint
            profile_url = f"{self.base_url}/api/v1/auth/profile"
            headers = {'Authorization': f'Bearer {token}'}

            response = self.session.post(
                profile_url,
                json={},
                headers=headers,
                timeout=self.timeout
            )

            if response.status_code != 200:
                return False, {
                    'service': 'auth',
                    'flow': 'profile',
                    'healthy': False,
                    'error': f'Profile failed: {response.status_code} - {response.text}'
                }

            return True, {
                'service': 'auth',
                'flow': 'complete',
                'healthy': True,
                'login_token': token[:20] + '...',
                'profile_data': response.json()
            }

        except Exception as e:
            return False, {
                'service': 'auth',
                'flow': 'auth_flow',
                'healthy': False,
                'error': str(e)
            }

def print_result(healthy: bool, result: Dict, verbose: bool = True):
    """Print formatted result"""
    status = "✅ PASS" if healthy else "❌ FAIL"
    service = result.get('service', 'unknown')

    if verbose:
        print(f"\n{service.upper()} SERVICE:")
        print(f"  Status: {status}")
        print(f"  URL: {result.get('url', 'N/A')}")

        if 'status_code' in result and result['status_code'] is not None:
            print(f"  HTTP Status: {result['status_code']}")
        if 'response_time' in result and result['response_time'] is not None:
            print(f"  Response Time: {result['response_time']}ms")
        if result.get('error'):
            print(f"  Error: {result['error']}")
        if result.get('data'):
            print(f"  Response: {json.dumps(result['data'], indent=2)}")
    else:
        print(f"{status} {service}")

def main():
    parser = argparse.ArgumentParser(description='NEXO ERP Health Checks')
    parser.add_argument('--service', help='Test specific service only')
    parser.add_argument('--base-url', default='http://localhost:3001',
                       help='Base URL for API Gateway (default: http://localhost:3001)')
    parser.add_argument('--ci', action='store_true',
                       help='CI/CD mode - exit with code based on results')
    parser.add_argument('--prod', action='store_true',
                       help='Production environment checks')
    parser.add_argument('--quiet', action='store_true',
                       help='Quiet mode - minimal output')

    args = parser.parse_args()

    # Adjust URLs for production
    if args.prod:
        args.base_url = args.base_url.replace('localhost', 'api.nexo-erp.com')

    checker = ServiceHealthChecker(args.base_url)
    results = []

    # Define services to check
    services = [
        ('auth', '/health'),
        ('crm', '/health'),
        ('stock', '/health'),
        ('sales', '/health'),
        ('purchases', '/health'),
        ('production', '/health'),
        ('notifications', '/health')
    ]

    if args.service:
        services = [(s, e) for s, e in services if s == args.service]

    if not args.quiet:
        print("🩺 NEXO ERP Backend Health Check")
        print("=" * 40)
        print(f"Base URL: {args.base_url}")
        print(f"Services to check: {len(services)}")
        print()

    # Check each service
    for service_name, endpoint in services:
        healthy, result = checker.check_service(service_name, endpoint)
        results.append((healthy, result))
        print_result(healthy, result, verbose=not args.quiet)

    # Special auth flow test
    if not args.service or args.service == 'auth':
        if not args.quiet:
            print("\n🔐 TESTING AUTH FLOW:")
        healthy, result = checker.check_auth_flow()
        results.append((healthy, result))
        print_result(healthy, result, verbose=not args.quiet)

    # Summary
    total_checks = len(results)
    passed_checks = sum(1 for healthy, _ in results if healthy)

    if not args.quiet:
        print(f"\n📊 SUMMARY:")
        print(f"  Total checks: {total_checks}")
        print(f"  Passed: {passed_checks}")
        print(f"  Failed: {total_checks - passed_checks}")
        print(".1f"
    # Exit codes for CI/CD
    if args.ci:
        sys.exit(0 if passed_checks == total_checks else 1)

if __name__ == '__main__':
    main()