
#include<stdio.h>
int main(void)
{
	char c;
	scanf("%c",&c);
	
	int i,j;
	int rows=c-'A'+1;
	
	for(i=1;i<=rows;i++)
	{
		for(j=1;j<=rows-i;j++)
		{
			printf(" ");
		}
		
		for(j=0;j<i;j++)
		{
			printf("%c",'A'+j);
		}
		for(j=i-2;j>=0;j--)
		{
			printf("%c",'A'+j);
		}
		printf("\n");
	}
	
	
	
	for(i=1;i<=rows-1;i++)
	{
	  for(j=1;j<=i;j++)
		{
			printf(" ");
		}		
		
	  for(j=0;j<rows-i;j++)
		{
			printf("%c",'A'+j);
		}
	  for(j=rows-i-2;j>=0;j--)
	     printf("%c",'A'+j);
		
		printf("\n");
	}
	
	return 0;
}
/*

   A    
  ABA  
 ABCBA 
ABCDCBA
 ABCBA   //i==1 rows-1=2
  ABA     //i=2  rows-2=1
   A  

*/

