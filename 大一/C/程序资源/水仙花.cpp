#include<stdio.h>
#include<math.h>
int main()
{
	int n,a,b,c;
	scanf("%d",&n);
	a=n/100;
	b=n/10%10;
	c=n%10;
	if(n==pow(a,3)+pow(b,3)+pow(c,3)) 
	{
	   printf("1"); 
	}
    else{
        printf("0");
    }
	return 0;
 }
