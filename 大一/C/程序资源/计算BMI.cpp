#include<stdio.h> 
int main()
{
	double a,b,BMI;
	scanf("%lf%lf",&a,&b);
	b=b/100;
	BMI=a/(b*b);
	printf("%.2f",BMI);
	return 0;
}
