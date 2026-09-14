/*#include<stdio.h>
int main(void)
{
	long int id[40];
	int score[40];
	int num=0;
	int i=0;
	long int search;
	
	printf("Input student’s ID and score:");
	
 
	do{
	scanf("%ld%d",&id[i],&score[i]);
	num+=1;
	i+=1;
    }while(id[i-1]>=0&&score[i-1]>=0);

	printf("Total students are %d\n",num);
	printf("Input the searching ID:");
	scanf("%ld",&search);
	
	int h=0;
	
	for(i=0;i<40;i++)
	{
		if(id[i]==search)
		{
			printf("score = %d\n",score[i]);
			h=1;
		}
	}
	if(h=0)
	printf("Not found!\n");
	
	
	return 0;
 } 

#include<stdio.h>

int main(void)
{
    long int id[40];      // 学号数组
    int score[40];        // 成绩数组
    int num = 0;          // 学生人数
    int i = 0;            // 数组索引
    long int search;      // 要查找的学号
    
    // 输入学生信息
    printf("Input student's ID and score:");
    
    // 循环输入，直到输入负值
    for(i = 0; i < 40; i++)
    {
        long int temp_id;
        int temp_score;
        
        // 读取学号和成绩 - 注意：要使用&获取地址
        scanf("%ld%d", &temp_id, &temp_score);
        
        // 检查是否结束输入
        if(temp_id < 0 || temp_score < 0)
        {
            break;  // 输入负值，结束输入
        }
        
        // 存储到数组
        id[num] = temp_id;
        score[num] = temp_score;
        num++;  // 学生人数增加
        
        // 为下一次输入准备提示
        printf("Input student's ID and score:");
    }
    
    // 输出总人数
    printf("Total students are %d\n", num);
    
    // 输入要查找的学号
    printf("Input the searching ID:");
    scanf("%ld", &search);
    
    // 查找学号
    int found = 0;  // 标记是否找到
    
    for(i = 0; i < num; i++)  // 只查找实际存储的数据
    {
        if(id[i] == search)
        {
            printf("score = %d\n", score[i]);
            found = 1;
            break;  // 找到后退出循环
        }
    }
    
    // 如果没有找到
    if(found == 0)  // 注意：要用==，不是=
    {
        printf("Not found!\n");
    }
    
    return 0;
}

*/

/*
#include<stdio.h>

int main(void)
{
    long int id[40];      // 学号数组
    int score[40];        // 成绩数组
    int num = 0;          // 学生人数
    int i = 0;            // 数组索引
    long int search;      // 要查找的学号
    
    // 输入学生信息
    printf("Input student's ID and score:");
    
    // 循环输入，直到输入负值
    for(i = 0; i < 40; i++)
    {
       
        // 读取学号和成绩 - 注意：要使用&获取地址
        scanf("%ld%d", &id[i], &score[i]);
        
        // 检查是否结束输入
        if(id[i]< 0 || score[i] < 0)
        {
            break;  // 输入负值，结束输入
        }
        
       num++;
        
        // 为下一次输入准备提示
        printf("Input student’s ID and score:");
    }
    
   
    printf("Total students are %d\n", num);
    
    
    printf("Input the searching ID:");
    scanf("%ld", &search);
    
    // 查找学号
    int found = 0;  // 标记是否找到
    
    for(i = 0; i < num; i++)  // 只查找实际存储的数据
    {
        if(id[i] == search)
        {
            printf("score = %d\n", score[i]);
            found = 1;
            break;  // 找到后退出循环
        }
    }
    
    // 如果没有找到
    if(found == 0)  // 注意：要用==，不是=
    {
        printf("Not found!\n");
    }
    
    return 0;
}

*/
/*
#include<stdio.h>
void ReadData(int a[],int n)
{
	int i;
	printf("Input %d numbers:\n",n);
	for(i=1;i<=n;i++)
	{
		scanf("%d",&a[i-1]);
	}
}
void  MaxMinExchang(int a[], int n)
{
	int t;
	int i;
	int max=0,min=0;
  
	
	for(i=0;i<n;i++)
	{
		if(a[max]<a[i])
		{
		max=i;
    	}
    	if(a[min]>a[i])
    	{
    		min=i;
		}
    	
	}
	t=a[max];
	a[max]=a[min];
	a[min]=t;
}
void PrintData(int a[],int n)
{
	int i;
	printf("Exchange results:");
	for(i=0;i<n;i++)
	{
	printf("%5d",a[i]);
    }
	printf("\n");
}
int main(void)
{
	int n;
	
	printf("Input n(n<=10):\n");
	scanf("%d",&n);

	int a[10];

	ReadData(a,n);
	MaxMinExchang(a,n);
	PrintData(a,n);
	
	return 0;
 } 
*/
/*
#include <stdio.h>

void Squeeze(char s[], char c);

int main(void)
{
    char a[80], c;

    scanf("%s", a);
    scanf("%c", &c);
    Squeeze(a, c);
    printf("%s\n", a);
}

void Squeeze(char s[], char c)
{
    int i, j;

    for (i = 0; s[i] != '\0'; i++)
    {
        if (s[i] == c)
        {
        	for(int j=i;s[j]!='\0';j++)
            {
			s[j] = s[j+1];
            }
        }
    }
    s[i] = '\0';
    
}
    
#include <stdio.h>

void Squeeze(char s[], char c);

int main(void)
{
    char a[80], c;

    scanf("%s", a);
    
    // 清除输入缓冲区中的换行符
    getchar();
    
    scanf("%c", &c);
    
    // 函数调用不需要写类型，直接传递参数
    Squeeze(a, c);
    
    printf("%s\n", a);
    
    return 0;
}

void Squeeze(char s[], char c)  // 去掉分号
{
    int i, j;

    j = 0;  // 新字符串的索引
    
    for (i = 0; s[i] != '\0'; i++)  // 去掉分号
    {
        if (s[i] != c)  // 如果当前字符不等于要删除的字符
        {
            s[j] = s[i];  // 保留该字符
            j++;          // 新字符串索引增加
        }
    }
    
    s[j] = '\0';  // 在新字符串末尾添加结束符
}

*/
/*
程序改错。
以下程序的功能是统计字符数。判断一个由’0’ ~ ‘9’这10个字符组成的字符串中哪个字符出现的次数最多。
输入数据：第一行是测试数据的组数m，每组测试数据占1行，每行数据不超过1000个字符且非空。
输出要求：m行，每行对应一组输入，包括出现次数最多的字符和该字符出现的次数。如果有多个字符出现的次数相同且最多，那么输出ASCII码最小的那一个。

#include <stdio.h>
#include <string.h>
int main( )
{
    int  cases, sum[10], i, max;
    char str[1000];   
    int t=0;
	                   
    scanf("%d", &case);  
	                  
  while (cases > 0)
    {
      scanf("%s", str);
	   
    for( i = 0; i < 10; i++)
        sum[i] = 0; 
        
    for(i = 0; i < strlen(str); i++)
         ++sum[str[i]- '0'];
         
         
    max = 0;   
    for (i = 1; i < 10; i++)
    {
	    if(sum[i] >= sum[max])
			max = i;
		else if(sum[i] == sum[max] && i < max)  // 次数相同取ASCII码小的
            max = i;
    }
            printf("%c %d\n", max+'0', sum[t]);
            
            
            cases --;
    }
    return 0;
}
对 max+'0' 的说明 
char str[] = "123";
// str[0] = '1' (ASCII 49)
// str[1] = '2' (ASCII 50)  
// str[2] = '3' (ASCII 51)

// 正确的方法：
int a = str[0] - '0';  // 49 - 48 = 1
int b = str[1] - '0';  // 50 - 48 = 2
int c = str[2] - '0';  // 51 - 48 = 3

// 错误的方法：
int wrong_a = str[0] - 0;  // 49 - 0 = 49
int wrong_b = str[1] - 0;  // 50 - 0 = 50
int wrong_c = str[2] - 0;  // 51 - 0 = 51




#include<stdio.h>
#include<string.h>
int main(void)
{
	char c[];
	printf("请输入字符串\n");
	scanf("%s",&c);
	int n=strlen(c);

	
	for(int j=0;s[j]!='0';j++)
	{
		t=s[j];
		s[j]=s[n-j-1];
		s[n-j-1]=t;
		
	}
	printf("the result:\n");
	printf("%s",s);
	
	return 0;
}

*/

/*
#include<stdio.h>
#include<malloc.h>
typedef struct
 { 
     char name[21]; //学生姓名
     int score; //学生成绩
} STU; 
void f(STU a[], int n, int *pmax, int *pmin)
{
	int i=0;
	int max=a[0].score;
	int min=a[0].score;

	for(i=0;i<n;i++)
	{
		if(max<=a[i]->score)
		{
		*pmax=i;
		max=i;
	    }
		if(min>=a[i]->score)
		{
		*pmin=i;
		min=i;
	    }
	}
}
int main(void)
{
	int n;

	
	prinf("Input n=");
	scanf("%d",&n);
	
	if(n<=0)
	{
	printf("Invalid n.\n");
	return 0;
    }
    

	STU* a=(STU*)malloc(sizeof(STU)*n);
	
	int i;
	for(i=0;i<n;i++)
	{
		printf("Input %d student names and scores:\n");
		scanf("%s%d",a[i].name,a[i].score);
		
	}
	int* pmax;
	int* pmin;
	
	f(a,n,pmax,pmin);
	
	int max=*pmax;
	int min=*pmin;
	
	printf("The highest score:\n");
	printf("%s:%d\n",a[max].name,a[max].score);
	
	printf("The lowest score:\n")
	printf("%s:%d\n",a[min].name,a[min].score);
	
	return 0;
}



*pmax = NULL;  // 错误：NULL用于指针，不应该用于整数下标

// 正确代码
*pmax = 0;  // 初始化为第一个学生的下标
3. main函数中的变量定义重复




scanf("%s%d", a[i].name, &a[i].score);
这里，a[i]是第i个STU结构体（从0开始）。
a[i].name 是结构体的成员，是一个字符数组。数组名本身就是地址，所以不需要加&。
a[i].score 是结构体的成员，是一个int类型。我们需要传递它的地址给scanf，所以要加&。


a+i 是STU
*(a+i) 是一个STU变量本身
a[i]是结构体变量，不是地址，不是指针
 */
/*

#include<stdio.h>
#include<malloc.h>
typedef struct
{
	char name[21]; //数组！！ 
    int score;
}STU;
void f(STU a[], int n, int *pmax, int *pmin)
{
	int max=a[0].score;
	int min=a[0].score;
	int i;
	for(i=0;i<n;i++)
	{
		if(max<a[i].score)
		{
			*pmax=i;
			max=a[i].score;
		}
		if(min>a[i].score)
		{
			*pmin=i;
			min=a[i].score;
			
		}
	}
}
int main(void)
{
	int n;
	printf("Input n=");
	scanf("%d",&n);
	
	STU* c=(STU*)malloc(sizeof(STU)*n);
	
	int i;
	for(i=0;i<n;i++)
	{
	    printf("Input %d student names and scores:\n",i+1);
	    scanf("%s%d",c[i].name,&c[i].score);
	}
	
	int* pmax;
	*pmax=0;
	int* pmin;
	*pmin=0;
	
	f(c,n,pmax,pmin);
	
	return 0;
}




// 定义变量，而不是指针
    int max_index, min_index;
    
    // 调用函数，传递变量的地址
    f(c, n, &max_index, &min_index);
    
    // 输出结果
    printf("The highest score:\n");
    printf("%s:%d\n", c[max_index].name, c[max_index].score);
    
    printf("The lowest score:\n");
    printf("%s:%d\n", c[min_index].name, c[min_index].score);
    
    // 释放内存
    free(c);
    
*/
/*
#include<stdio.h>
void fc(int n, int* pc)
{
	int t;//每一次输出 
	int shuchu=0;//操作的次数 
	
	while(n!=1)
	{
		if(shuchu%5==0&&shuchu!=0)
		{
			printf("\n");
		}
		if(n%2==0)
		{
			n=n/2;
		}
		else
		{
			n=n*3-1;
		}
		printf("%5d",n);
		shuhcu++
    }
    *pc=shuhcu;
	if(n%2==0)
	{
		t=n;
			for(t=0;t!=1;shuchu++)
			{
				if(shuchu/5==0&&shuchu!=0)
				{
					printf("\n");
				}
				t=t/2;
			    printf("%5d",t);
			    
			}
	}
	else
	{
		t=n;
			for(t=0;t!=1;shuchu++)
			{
				if(shuchu/5==0&&shuchu!=0)
				{
					printf("\n");
				}
		         t=t*3-1;
		         printf("%5d",t);
		    }
		
	}	
		
	*pc=shuchu;	
		
	}
	*/

/*
int main(void)
{
	int n;
	int STEP;
	printf("Input n=");
	scanf("%d",&n);
	
	if(n<1)
	{
	   printf("Input wrong\n");
	}
	
	
	fc(n,&STEP);
	printf("STEP=%d\n",STEP);
	
	
	return 0;
}



#include<stdio.h>
void fc(int n,int* pc)
{
	int cishu=0;
	
		while(n!=1)
		{
			if(n%2==0)
			{
				n=n/2;
			}
	        else
	        {
	        	n=n*3-1;
	        	
			}
		printf("%5d",n);
		cishu++;
		if(cishu%5==0&&cishu!=0)
		printf("\n");
	    }
	
	
	*pc=cishu;
}
int main(void)
{
	int n;
	int cishu;
	
	scanf("%d",&n);
	if(n<1)
	{
	printf("Input wrong\n");
	return 0;
    }
	fc(n,&cishu);
	int STEP=cishu;
	
	printf("STEP=%d\n",STEP);
	return 0;
}


#include<stdio.h>
int main(void)
{
	int i;
	char min[100];
	printf("Input five countries' names:\n");
    char c1=gets();
    char c2=gets();
    char c3=gets();
    char c4=gets();
    char c5=gets();
    
	int j;
	while(i!=-1)
	{
		
		i++;
	}
	
	
	printf("The minimum is:%s\n");
	
	
	return 0;
}



#include<stdio.h>
#include<string.h>
int main(void)
{
	char country[5][31];
	int i;
	
	for(i=0;i<=5;i++)
	{
		gets(country[i]);
	}
	char min[31];
	
	for(i=0;i<=5;i++)
	{
		if(strcmpy(min[31],country[i]))
		min[31]=country[i];
		
	}
	printf("The minimum is:%s\n",*min[31]);
	return 0;
}


#include <stdio.h>
#include <string.h>

int main(void)
{
    char country[5][31];
    char min[31];
    int i;

    printf("Input five countries' names:\n");

    for(i = 0; i < 5; i++)
    {
        gets(country[i]);
    }

    strcpy(min, country[0]);

    for(i = 1; i < 5; i++)
    {
        if(strcmp(country[i], min) < 0)
        {
            strcpy(min, country[i]);
        }
    }

    printf("The minimum is:%s\n", min);

    return 0;
}

#include<stdio.h>
int gcd(int a,int b)
{
	if(b==0)
	return a;
	else
	return gcd(b,a%b);
}
int gcdn(int*a,int n)
{
	if(n==1)
	return a[0];
	else
	return gcd(gcdn(a,n-1),a[n-1])
}
int main(void)
{
	int a[8];
	int i=0;
	int t;
	
	for(i=0;i<=7;i++)
	{
		scanf("%d",&t);
		if(t<=0)
		{
		
			break;
		}
		
		else
		a[i]=t;
	}
	
	int jieguo=gcdn(a,i);
	printf("GCD=%d\n",jieguo);
	
	return 0;
}


#include <stdio.h>

int gcd(int a, int b)
{
    if(b == 0)
        return a;
    else
        return gcd(b, a % b);
}

int gcdn(int *a, int n)
{
    if(n == 1)
        return a[0];
    else
        return gcd(gcdn(a, n-1), a[n-1]);
}

int main(void)
{
    int a[8];
    int i = 0;
    int t;

    while(i < 8)
    {
        scanf("%d", &t);
        if(t <= 0)
            break;//此时i==0 
        a[i] = t;
        i++;
    }

    if(i == 0)
    {
        printf("GCD=NONE\n");
        return 0;
    }

    printf("GCD=%d\n", gcdn(a, i));

    return 0;
}


#include<stdio.h>
int main(void)
{
	int a[8];
	int i;
	int xiabiao;
	while(i<8)
	{
		scanf("%d",&t);
		if(t<=0)
		break;
		xiabiao=i++;
		a[xiabiao]=t;
	}
	
	if(i==0)
	{
		printf("GCD=NONE\n");
		return 0;
	}
	return 0;
}







#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int data;
    struct node *next;
} Node;

int main(void)
{
    Node *head = NULL;
	Node *tail = NULL;
	Node *p;
    int x;

    /* 建立链表 
    while (1)
    {
        scanf("%d", &x);
        if (x == 0)
            break;

        p = (Node *)malloc(sizeof(Node));
        p->data = x;
        p->next = NULL;

        if (head == NULL)
        {
            head = p;
            tail = p;
        }
        else
        {
            tail->next = p;
            tail = p;
        }
    }

    输出链表 
    p = head;
    while (p != NULL)
    {
        printf("%d ", p->data);
        p = p->next;
    }
    printf("\n");

  //输入要查找的数 
    scanf("%d", &x);

 //查找直接前驱 
    if (head == NULL)
    {
        printf("无此结点\n");
        return 0;
    }

    if (head->data == x)
    {
        printf("%d无直接前驱\n", x);
        return 0;
    }

    p = head;
    while (p->next != NULL)
    {
        if (p->next->data == x)
        {
            printf("%d的直接前驱是%d\n", x, p->data);
            return 0;
        }
        p = p->next;
    }

    printf("无此结点\n");

    return 0;
}

/*
??【你只需要记住这 5 个“背诵锚点”】【很重要】
① 结点结构一定长这样

typedef struct node
{
    int data;
    struct node *next;
} Node;
② 用 head + tail 建链表（按输入顺序）
复制代码
C
if (head == NULL)
{
    head = p;
    tail = p;
}
else
{
    tail->next = p;
    tail = p;
}
?? 这是“顺序连接”的标准写法
③ 输出链表 = 从 head 一直走
复制代码
C
p = head;
while (p != NULL)
{
    printf("%d ", p->data);
    p = p->next;
}
printf("\n");
④ 判断「第一个结点」
复制代码
C
if (head->data == x)
{
    printf("%d无直接前驱\n", x);
}
⑤ 找“直接前驱”的核心判断（最重要）
复制代码
C
if (p->next->data == x)
{
    printf("%d的直接前驱是%d\n", x, p->data);
}
一定是 p->next 在比！


#include<stdio.h>
#include<malloc.h>
typedef struct
{ char name[21]; /*学生姓名
int score; /*学生成绩
} STU;
void f(STU a[], int n, int *pmax, int *pmin)
{
	int max=a[0].score;
	int min=a[0].score;
	int i;
	int mint,maxt;
	for(i=0;i<n;i++)
	{
		if(max<a[i].score)
		{
			max=a[i].score;
			maxt=i;
		}
		if(min>a[i].score)
		{
			min=a[i].score;
			mint=i;
		}
	}
	*pmax=maxt;
	*pmin=mint;
}
int main(void)
{
	int n;
	printf("Input n=");
	scanf("%d",&n);
	if(n<=0)
	{
		printf("Invalid n.\n");
		return 0;
	}
	STU*c=(STU*)malloc(sizeof(STU)*n);
	printf("Input %d student names and scores:\n");
	
	int i;
	for(i=0;i<n;i++)
	{
		scanf("%s%d",c[i].name,&c[i].score);
	}
	int max;
	int min;
	f(c,n,&max,&min);
	printf("The highest score:\n",max);
	printf("The lowest score:\n",min);
	return 0;
}


#include<stdio.h>
void fc(int n, int*pc)
{
	int cishu=0;
	*pc=cishu;
	while(n!=1)
	{
		if(n%2==0)
		{
			n=n/2;
			printf("%5d",n);
			cishu++;
		}
		else
		{
			n=n*3+1;
			printf("%5d",n);
			cishu++;
		}
		if(cishu%5==0)
		printf("\n");
	}
}
int main(void)
{
	int n;
	scanf("%d",&n);
	int cishu;
	
	fc(n,&cishu);
	printf("STEP=%d\n",cishu);
	return 0;
 } 


#include<stdio.h>
#include<string.h>
int main(void)
{
	char country[5][31];
	int i;
	printf("Input five countries' names:\n");
	for(i=0;i<5;i++)
	{
		gets(country[i]);
	}
	char min[31];
	strcpy(min,country[0]);
	for(i=0;i<5;i++)
	{
		if(strmpy(min,country[i]))
		{
			min=country[i];
		}
	}
	printf("The minimum is:%s\n",min);
	return 0;
}



#include<stdio.h>
int gcd(int a,int b)
{
	if(b==0)
	return a;
	else
	return gcd(b,a%b);
}
int gcdn(int*a, int n)
{
	if(n==1)
	return a[0];
	else
	return gcd(gcdn(a, n-1), a[n-1]);
}
int main(void)
{
	int jieguo;
	
	int a[8];
	int i;
	for(i=0;i<8;i++)
	{
	
		scanf("%d",a[i]);
		if(a[i]<=0)
		break;
	}
	if(i==0)
	printf("GCD=NONE\n");
	
	else
	{
		jieguo=gcdn(a, i);
		printf("GCD=%d\n",jieguo);
	}
	
	return 0;
}




*/ 

/*
#include<stdio.h>
#include<malloc.h>

int main(void)
{
	int num;
	
	printf("Enter array size:");
	scanf("%d",&num);
	
	int* n=(int*)malloc(sizeof(int)*num);
	
	int i;
	for(i=0;i<num;i++)
	{
		printf("array[%d]=%d\n",i,i*10);
	}
	return 0;
}




输入一行字符（第一个字符有可能是空格），用函数编程统计其中有多少单词。假设单词之间以空格分开。要求如下：
（1）在主函数中从键盘输入字符串，字符串的最大长度为80个字符 
     调用CountWords函数，并统计字符串中的单词个数。
（2）在子函数CountWords中统计字符串中的单词个数。函数原型为：
     int CountWords(char str[]);
(3)**输入提示信息："Input a string:"
   **输出提示信息和格式："Numbers of words = %d\n"
   **用gets()输入字符串
注：不能使用指针、结构体、共用体、文件、goto、枚举类型进行编程。

*/
/*
#include<stdio.h>
int CountWords(char str[])
{
	int i,j;
	int num=0;
	
	for(i=0;i<80;i++)
	{
		if(str[i]!=' '&&(i==0||str[i-1]==' '))
		{
		  num++;
		
		}
	}
	
	return num;
}
int main(void)
{
	char str[80];
	printf("Input a string:");
	gets(str);
	
	int num=CountWords(str);
	
	printf("Numbers of words = %d\n",num);
	
	return 0;
}


*/
/*
#include<stdio.h>
#include<string.h>
int main(void)
{
	char c[1000];
	gets(c);   //gets 只能单行输入 
	char num=0;
	num=strlen(c);
	
	int line=0,word=0,chars=0;
	int i;
	for(i=0;i<num;i++)
	{
		if((c[i]=='\n')||(c[i]==' ')||(c[i]=='\t'))//i 改为c[i] 
		word++;
		//应该是从分隔符进入非分隔符时 才算一个新单词
		 
		if(i=='\n')
		line++;
		
		if(i!=' ')
		chars++;
		
	}
	
	
	return 0;
}


#include<stdio.h>
int main(void)
{
	
	char ch;
	int line=0;
	int word=0;
	int chars=0;
	
	gets(ch);
	
	int yesword;
	
	while(ch!=OEF)
	{
		chars++;
		
		if(yesword=0)
		word++;
		
		if(ch=='\n')
		line++;
		
		if((ch==' ')||(ch=='\t')||(ch=='\n'))
		{
			yesword=0;
		}else
		{
			yesword=1;
			
			
		}
		
	}
	
	
	printf("Lines=%d\nWords=%d\nChars=%d\n",line,word,chars);
	return 0;
}






#include<stdio.h>
int main(void)
{
	
	char ch;
	int line=0;
	int word=0;
	int chars=0;
	

	
	int yesword=0;
	
	while((ch=getchar())!=EOF)
	{
		chars++;
		
	
		
		if(ch=='\n')
		line++;
		
		if((ch==' ')||(ch=='\t')||(ch=='\n'))
		{
			yesword=0;
		}else
		{	if(yesword==0)
		    {
			word++;
			yesword=1;
		    }
			
		}
		
	}
	
	
	printf("Lines=%d\nWords=%d\nChars=%d\n",line,word,chars);
	return 0;
}

*/







#include <stdio.h>
int MyStrcmp(char s[], char t[]);   //函数调用中，这个相当于char* s,char* t 

//函数调用中，形参只能写：
char [],char t[]
或者 char * s, char* t


char s 表示的是一个字符变量，只能存一个字符 
int main(void)
{
    char  str1[20],str2[20];
 
    printf("Input string:");
    gets(str1);
    printf("Input another string:");
    gets(str2);     
 
    if (MyStrcmp(str1,str2) > 0) 
	//数组名本身就是地址，str[]这种写法只能出现在定义里，在函数调用中这样写时语法错误 
    {
        printf("str1 大于 str2\n");
    }
    else if (MyStrcmp(str1,str2) < 0)
    {
        printf("str1 小于 str2\n");
    }
    else
    {
        printf("str1 等于 str2\n");
    }
}
 
int MyStrcmp(char s[], char t[])
{
    int i;
 
    for (i=0; s[i] == t[i]; i++)        
    {
            if (s[i] == '\0' )  
			return 0 ;   
    }
    return (s[i] - t[i]);
}













一-1?? 计算与统计（必考）
核心知识
for 循环
累加变量
计数变量
模板思想
复制代码
C
sum = 0;
count = 0;
例题
?? 输入 n 个整数，统计正数个数，并求它们的和
复制代码
C
#include <stdio.h>

int main() {
    int n, x;
    int sum = 0, count = 0;

    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &x);
        if (x > 0) {
            sum += x;
            count++;
        }
    }

    printf("%d %d\n", count, sum);
    return 0;
}
一-2?? 最大值 / 最小值 / 第二大（超级爱考）
核心知识
假设法
下标记录
例题 1：找最大值和下标
复制代码
C
int max = a[0];
int pos = 0;

for (int i = 1; i < n; i++) {
    if (a[i] > max) {
        max = a[i];
        pos = i;
    }
}
例题 2：找第二大（重点）
复制代码
C
int max1, max2;

if (a[0] > a[1]) {
    max1 = a[0];
    max2 = a[1];
} else {
    max1 = a[1];
    max2 = a[0];
}

for (int i = 2; i < n; i++) {
    if (a[i] > max1) {
        max2 = max1;
        max1 = a[i];
    } else if (a[i] > max2) {
        max2 = a[i];
    }
}
一-3?? 打印字符图形（送分题）
核心知识
双重 for
行列关系
例题：打印 n 行 n 列的 *
复制代码
C
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        printf("*");
    }
    printf("\n");
}
一-4?? 搜索与穷举
核心知识
穷举所有可能
if 判断条件
例题：找所有满足 a + b = 10 的正整数对
复制代码
C
for (int a = 1; a <= 9; a++) {
    for (int b = 1; b <= 9; b++) {
        if (a + b == 10) {
            printf("%d %d\n", a, b);
        }
    }
}
一-5?? 累加 / 累乘 / 递推
例题 1：累乘（n!）
复制代码
C
int fact = 1;
for (int i = 1; i <= n; i++) {
    fact *= i;
}
例题 2：数列递推（考试常见）
复制代码
C
int a1 = 1, a2 = 1, a3;

for (int i = 3; i <= n; i++) {
    a3 = a1 + a2;
    a1 = a2;
    a2 = a3;
}
一-6?? 数论（素数 / gcd / lcm）
素数判断（必背）
复制代码
C
int isPrime(int x) {
    if (x <= 1) return 0;
    for (int i = 2; i * i <= x; i++) {
        if (x % i == 0)
            return 0;
    }
    return 1;
}
最大公约数（辗转相除）
复制代码
C
int gcd(int a, int b) {
    int r;
    while (b != 0) {
        r = a % b;
        a = b;
        b = r;
    }
    return a;
}
一-9?? 一维数组 + 删除元素（重灾区）
核心思想
删除 = 后面的元素往前挪
例题：删除数组中所有等于 x 的元素
复制代码
C
int k = 0;
for (int i = 0; i < n; i++) {
    if (a[i] != x) {
        a[k] = a[i];
        k++;
    }
}
n = k; // 新长度
一-11?? 递归算法（只考最简单）
例题：递归求 n!
复制代码
C
int fact(int n) {
    if (n == 1) return 1;
    return n * fact(n - 1);
}
?? 考试不会写复杂递归，放心
一-12?? 字符串处理（考试常见）
核心知识
char 数组
'\0'
例题：自己写 strlen
复制代码
C
int mylen(char s[]) {
    int i = 0;
    while (s[i] != '\0')
        i++;
    return i;
}

























































































































