from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import unittest
import time
import os

class AdidasWebsiteTests(unittest.TestCase):
    def setUp(self):
        chrome_options = Options()
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        
        try:
            # Explicitly specify the Chrome version
            chrome_manager = ChromeDriverManager(version="stable")
            driver_path = chrome_manager.install()
            print(f"ChromeDriver path: {driver_path}")
            
            # Create the service with specific configuration
            service = Service(
                executable_path=driver_path,
                log_path="chromedriver.log"  # This will help with debugging
            )
            
            self.driver = webdriver.Chrome(
                service=service,
                options=chrome_options
            )
            
            self.driver.set_window_size(1920, 1080)
            self.driver.implicitly_wait(10)
            self.base_url = "http://localhost:8000"
            
        except Exception as e:
            print(f"Error during setup: {str(e)}")
            # Print more detailed error information
            import traceback
            print(traceback.format_exc())
            raise
    
    def tearDown(self):
        # Close the browser after each test
        if hasattr(self, 'driver'):
            try:
                self.driver.quit()
            except Exception as e:
                print(f"Error during teardown: {str(e)}")

    def test_01_login_functionality(self):
        """Test to verify login functionality"""
        driver = self.driver
        
        # Navigate to login page
        driver.get(f"{self.base_url}/login")
        
        try:
            # Wait for the login form to be visible
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            
            # Find form elements and fill them
            username_field = driver.find_element(By.ID, "username")
            password_field = driver.find_element(By.ID, "password")
            submit_button = driver.find_element(By.TAG_NAME, "button")
            
            # Input test credentials
            username_field.send_keys("RMJ20")
            password_field.send_keys("abcd1234")
            
            # Submit the form
            submit_button.click()
            
            # Wait for redirect to home page and verify
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "WelcomeView"))
            )
            
            # Verify we're on the home page
            self.assertTrue("Adidas" in driver.page_source)
            self.assertTrue("Footballing Excellence" in driver.page_source)
            print("✓ Login test passed successfully")
            
        except TimeoutException:
            self.fail("Login page elements not found or login failed")
        except Exception as e:
            self.fail(f"Login test failed: {str(e)}")

    def test_02_order_form_submission(self):
        """Test to verify order form submission and thank you page"""
        driver = self.driver
        
        # Navigate directly to order page
        driver.get(f"{self.base_url}/order")
        
        try:
            # Wait for the order form to be visible
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "OrderView"))
            )
            
            # Fill in the order form
            form_data = {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "1234567890",
                "address1": "123 Main Street",
                "address2": "Apartment 4B",
                "city": "Mumbai",
                "state": "Maharashtra"
            }
            
            # Fill each form field
            for field_id, value in form_data.items():
                field = driver.find_element(By.ID, field_id)
                field.send_keys(value)
            
            # Submit the order
            submit_button = driver.find_element(By.TAG_NAME, "button")
            submit_button.click()
            
            # Wait for thank you page and verify
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "ThankYouView"))
            )
            
            # Verify thank you page content
            thank_you_content = driver.page_source
            self.assertTrue("Thank You for Your Order!" in thank_you_content)
            self.assertTrue(form_data["address1"] in thank_you_content)
            self.assertTrue(form_data["city"] in thank_you_content)
            print("✓ Order submission test passed successfully")
            
        except TimeoutException:
            self.fail("Order form elements not found or submission failed")
        except Exception as e:
            self.fail(f"Order submission test failed: {str(e)}")

    def test_03_ground_and_product_navigation(self):
        """Test to verify ground selection and product pages navigation"""
        driver = self.driver
        
        # Navigate to ground selection page
        driver.get(f"{self.base_url}/ground")
        
        try:
            # Verify both ground options are present
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "FGView"))
            )
            
            # Check if both ground options are visible
            fg_button = driver.find_element(By.XPATH, "//a[@href='/FG']")
            ag_button = driver.find_element(By.XPATH, "//a[@href='/AG']")
            
            # Test FG page
            fg_button.click()
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "boot-img"))
            )
            self.assertTrue("Predator FG" in driver.page_source)
            
            # Go back to ground page
            driver.get(f"{self.base_url}/ground")
            
            # Test AG page
            ag_button = driver.find_element(By.XPATH, "//a[@href='/AG']")
            ag_button.click()
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "boot-img"))
            )
            self.assertTrue("Predator AG" in driver.page_source)
            print("✓ Ground and product navigation test passed successfully")
            
        except TimeoutException:
            self.fail("Ground selection or product pages failed to load")
        except Exception as e:
            self.fail(f"Ground and product navigation test failed: {str(e)}")

if __name__ == "__main__":
    unittest.main()