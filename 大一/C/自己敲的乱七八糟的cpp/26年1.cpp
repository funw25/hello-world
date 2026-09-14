/*读入一个整数n和整数k，程序输出n的从右向左的第k个十进制数字位值。例如，读入n=1234, k=2，则程序输出3。
**输入格式要求："%d%d" 提示信息："input integer n and k:\n"
**输出格式要求："%d"
程序运行示例如下：
input integer n and k:
1234 2
3                                                            

#include<stdio.h>
int main(void)
{
	int n,k;
	printf("input integer n and k:\n");
	scanf("%d%d",&n,&k);
	int i;
	int t=0;
	for(i=1;i<k;i++)
	{
		t=n/10;//每次t都是n/10，是一个定值 
	}
	
	//使循环结束时的n，n的最后一位是要求的数字。
	 
	t=t%10;
	printf("%d",t);
	
	return 0;
}




#include<stdio.h>
int main(void)
{
	int n,k;
	printf("input integer n and k:\n");
	scanf("%d%d",&n,&k);
	int i;
	int t=0;
	for(i=1;i<k;i++)
	{
	n=n/10;
	}
	t=n%10;
	printf("%d",t);
	
	return 0;
}
*/
/*
#include<stdio.h>
int sushu(int* a)
{
	int t,result,j;
	t=*a;
	if(t<=1)
	result=0;
	else
	{
	  result=1;
			
	for(j=2;j*j<=t;j++)
	   {
			if(t%j==0)
			{
				result=0;
				return result;
			}
		}
	}
	return result;	
}
int main(void)
{
	int n;
	int a[100];
	int su[100];
	
	printf("输入一个正整数n，然后输入n个整数。");
	scanf("%d",&n);
	int i;
	for(i=0;i<=n;i++)
	{
		scanf("%d",&a[i]);
	}
	
	
	int count=0;
	int t,j,m=0;
	int result;
	
	for(i=0;i<=n;i++)
	{
		result=sushu(&a[i]);
		
		if(result==1)
		{
		count++;
		su[m]=a[i];
		m++;
	    }
	}
	
	int max=su[0];
	int min=su[0];
	
	for(i=0;i<=99;i++)
	{
		if(max<su[i])
		max=su[i];
		if(min>su[i])
		min=su[i];
		
	}
	
	printf("素数个数：count = %d",count);
    printf("最大素数：max =%d",max);
    printf("最小素数：min = %d",min);
    
	return 0;
}
*/
/*
#include<stdio.h>
#include<malloc.h>
int main(void)
{
	int n;
	double sum=0;
    int i;
	
	printf("Input n\n");
	scanf("%d",&n);
	
	int* a=(int*)malloc(n*sizeof(int));
	int* b=(int*)malloc(n*sizeof(int));
	printf("Input array a\n");
    for(i=0;i<n;i++)
    {
    	scanf("%d",&a[i]);
	}
	printf("Input array b\n");
	for(i=0;i<n;i++)
	{
		scanf("%d",&b[i]);
	}
	
	for(i=0;i<n;i++)
	{
		sum+=a[i]*b[i];
	}
	printf("\nsum=%lf",sum);
	
	return 0;
}

*/
/*
#include<stdio.h>
int main(void)
{
	int n;
	
	printf("Enter n(1-9):\n");
	scanf("%d",&n);
	int i;
	t=n;
	for(i=1;i<=2*t-1;i++)
	{
		for(j=1;j<=n-t;j++)
		printf(" ");
		
		printf("%d",n);
		printf("\n");
	
	}
	for(i=1;i)
	return 0;
}

*/
/*
#include<stdio.h>
int main(void)
{
	int n;
	printf("Enter n(1-9):\n");
	scanf("%d",&n);
	int i,j,t=n;
	for(i=1;i<=n;i++)
	{
		for(j=1;j<=i-1;j++)
		printf(" ");
		
		for(j=1;j<=2*t-1;j++)
		{
			printf("%d",t);
		}
		printf("\n");
		t--;
	}
	for(i=2;i<=n;i++)
	{
		for(j=1;j<=n-i;j++)
		printf(" ");
		
		for(j=1;j<=2*i-1;j++)
		{
			printf("%d",i);
		}
		printf("\n");
		
	}
	return 0;
}
*/
/*
#include<stdio.h>
#include<malloc.h>
int sushu(int a)
{
	int i,j;
	int jieguo=0;
	if(a<=1)
	return jieguo;
	else
	{
		for(i=2;i*i<=a;i++)
		{
			jieguo=1;
			if(a%i==0)
			{
			jieguo=0;
			return jieguo;
		    }
		}
	}
	return jieguo;
}
int main(void)
{

	int i,j;
	int m,n;
	printf("请输入m，n：");
	scanf("%d%d",&m,&n);
	int a[m][n];
	
	for(i=0;i<m;i++)
	{
		for(j=0;j<n;j++)
		scanf("%d",&a[i][j]);
	}
	 
	int* c=(int*)malloc(m*sizeof(int));
	int t;
	int jieguo;
	for(i=0;i<m;i++)
	{
		for(j=0;j<n;j++)
		{
			jieguo=sushu(a[i][j]);
			if(jieguo==1)
			c[i]++;
			
		}
	}
	for(i=0;i<m;i++)
	printf("%d",c[i]);
	return 0;
}

*/
/*
#include<stdio.h>
int main(void)
{
	int m;
	int i,j;
	int num=0;
	
	printf("请输入上限值m:");
	scanf("%d",&m);
	printf("m以内的勾股数组有:\n");
	int x,y,z;
	for(x=1;x<=m;x++)
	{
		for(y=x;y<=m;y++)
		{
			for(z=1;z<=m;z++)
			if(x*x+y*y==z*z)
			{
				if(num!=0&&num%3==0)
				printf("\n");
				printf("(%d  %d  %d)\t",x,y,z);
				num++;
		    }
		}
	}
	printf("\n");
	printf("\n共%d组勾股数.",num);
	
	return 0;
}

*/
/*
#include<stdio.h>
#include<malloc.h>
int main(void)
{
	int n,m;
	printf("共有多少个数？");
	scanf("%d",&n);
	printf("后移多少个？");
	scanf("%d",&m);
	
	int* a=(int*)malloc(n*sizeof(int));
	int *c=(int*)malloc(n*sizeof(int));
	printf("请以,号为间隔输入%d个数。\n",n);
	int i;
	for(i=0;i<n;i++)
	{
		scanf("%d",&a[i]);
		getchar();
	}
	
	
	int j=0;
	for(i=n-m;i<n;i++)
	{
	    c[j]=a[i];
		j++;	
	}
	//i=3, i<5,
	//c[0]=a[3]=4;
	//j++,j==1;
	//i++.i=4,i<5
	
	//c[1]=a[4]=5
	//j++,j==2;
	//i++,i==5;
	//循环结束
	
	 
	i=0;
	for(j;j<n;j++)
	{
		c[j]=a[i];
		i++;
	}
	//j==2;j<5,
	//c[2]=a[0];
	//i++,i==1;
	printf("移动后顺序为：\n");
	for(i=0;i<n;i++)
	{
		printf("%d",c[i]);
		if(i<n-1)
		printf(",");
	}
	return 0;
}

*/
/*
#include<stdio.h>
#include<malloc.h>
void ReadData(int a[], int n);
void PrintData(int a[], int n);
void  MaxMinExchang(int a[], int n);
int main(void)
{
	int n;
	printf("Input n(n<=10):\n");
	scanf("%d",&n);
	int*a=(int*)malloc(n*sizeof(int));
	printf("Input %d numbers:\n",n);
	ReadData(a,n);//参数int a[]实际上是一个指针（指向int的指针），
	//所以函数内部通过这个指针（数组名）来访问和修改的是原始数组的元素。
	
	MaxMinExchang(a,n);
	PrintData(a,n);
	
	return 0;
}
void ReadData(int a[], int n)
{
	int i;
	for(i=0;i<n;i++)
	scanf("%d",&a[i]);
}
void PrintData(int a[], int n)
{
	int i;
	printf("Exchange results:");
	for(i=0;i<n;i++)
	{
		printf("%5d",a[i]);
	}
}
void  MaxMinExchang(int a[], int n)
{
	int max=a[0];
	int min=a[0];
	int i,t;
	int tmax=0;
	int tmin=0;
	for(i=0;i<n;i++)
	{
		if(max<a[i])
		{max=a[i];
		tmax=i;
		}
		if(min>a[i])
		{min=a[i];
		tmin=i;
		}
		
	}
	t=a[tmax];
	a[tmax]=a[tmin];
	a[tmin]=t;
	

}

*/
/*
#include<stdio.h>
int Max(int t[])
{
	int i,j;
	int tem;

	for(i=1;i<=4;i++)
	{
		for(j=i+1;j<=4;j++)
		{
			if(t[i]<t[j])
			{
				tem=t[i];
				t[i]=t[j];
				t[j]=tem;
				
			}
		}
   }
   int max=1000*t[1]+100*t[2]+10*t[3]+t[4];
   return max;
}
int Min(int t[])
{
	int i,j;
	int tem;

	for(i=1;i<=4;i++)
	{
		for(j=i+1;j<=4;j++)
		{
			if(t[i]>t[j])
			{
				tem=t[i];
				t[i]=t[j];
				t[j]=tem;
				
			}
		}
   }
   int min=1000*t[1]+100*t[2]+10*t[3]+t[4];
   return min;
}
int main(void)
{
	int num;
	printf("Enter number:");
	scanf("%d",&num);
	int t[5];
	t[1]=num%10;//4
	t[2]=num/10%10;//3
	t[3]=num/100%10;//2
	t[4]=num/1000;//1

	int jieguo=num;
    int i;
    	
    for(i=1;jieguo!=6174;i++)
  	{       
	        t[1]=jieguo%10;
	        t[2]=jieguo/10%10;
	        t[3]=jieguo/100%10;
	        t[4]=jieguo/1000;
			int max=Max(t);	
	        int min=Min(t);	
          jieguo=max-min;
            printf(" [%d]:%d-%d=%d\n",i,max,min,jieguo);
            
        
}
	return 0;
}

*/

/*
#include<stdio.h>
#define PI 3.14
int main(void)
{
	int r;
	double sum=0;
    for(r=1;r<=10;r++)
    {
    	double s=PI*r*r;
    	if(s<50)
	    {
		printf("area=%.2f\n",s);
	    sum+=s;
	    }
	    else
	    {break;
		}
	}
	
	    printf("sum=%.2f\n",sum);
	
	return 0;
}
*/
/*
#include<stdio.h>
int CountWords(char str[])
{
	int num=0;
	int wordyes=0;
	for(int i=0;str[i]!='\0';i++)
	{
		if(str[i]==' ')
		wordyes=0;
		else if(wordyes==0)
		{
		wordyes=1;
	    num++;
		}
	
	}
	return num;
}
int main(void)
{
	char str[81];
	printf("Input a string:");
	gets(str);
	int num=CountWords(str);
	printf("Numbers of words = %d\n",num);
	
	return 0;
}

*/
/*
#include<stdio.h>
int main(void)
{
	int g,s,b;
	for(b=1;b<5;b++)
	{
		for(s=1;s<5;s++)
		{
			for(g=1;g<5;g++)
			{
				if(g!=s&&g!=b&&b!=s)
				printf("%d%d%d\n",b,s,g);
			}
		}
	}
}

*/
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */


/*#include<stdio.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) 
{
    int i,j;
    for(i=0;i<numsSize;i++)
    {
        for(j=i;j<numsSize;j++)
        {
            if(nums[i]+nums[j]==target)
            {
                returnSize[0]=i;
                returnSize[1]=j;
                return returnSize;
            }
        }
    }
    
}
int main(void)
{
    int i=1,j,t;
    int *nums;
    int target;
    scanf("nums = [%d,",&t);
    nums[i]=t;
    while(t>=-100000000&&t<=1000000000)
    {
        if(scanf("%d]",&t))
        break;
        else
        {
           scanf("%d,",&t);
           nums[i]=t;
           i++;
        }
     
       
    }
    getchar();
    scanf("target = %d",&target);
    int len=sizeof(nums);
    int* returnSize=twoSum(nums,len,target,returnSize);
    printf("[%d,%d]",returnSize[0],returnSize[1]);
    return 0;
}
*/

#include<malloc.h>
#include<stdio.h>
int xorOperation(int n, int start) {
    int i;
    int ret=0;
    int* nums=(int*)malloc(n*sizeof(int));
    
    for(i=1;i<n;i++)
    {
        nums[i]=start+2*i;
        printf("%d",nums[i]);
        if(i==0)
        ret=nums[i];
        else
        ret=ret^nums[i];
    }
    return ret;
}
int main (void)
{
	int n;
	int start;
	scanf("%d,%d",&n,&start);
	printf("%d",xorOperation(n,start));
	
	
	return 0;
} 
























